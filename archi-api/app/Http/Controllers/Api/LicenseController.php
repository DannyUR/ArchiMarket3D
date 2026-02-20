<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LicenseController extends Controller
{
    /**
     * Listar licencias de un modelo (público)
     * GET /api/licenses/model/{modelId}
     */
    public function index($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $licenses = License::where('model_id', $modelId)
            ->select('id', 'model_id', 'type', 'description', 'created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'model_id' => $modelId,
                'model_name' => $model->name,
                'licenses' => $licenses
            ]
        ]);
    }

    /**
     * Mostrar una licencia específica (público)
     * GET /api/licenses/{id}
     */
    public function show($id)
    {
        $license = License::with('model:id,name')
            ->select('id', 'model_id', 'type', 'description', 'created_at')
            ->find($id);

        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Licencia no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $license
        ]);
    }

    /**
     * Crear una licencia (admin)
     * POST /api/admin/licenses
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model_id' => 'required|exists:models,id',
            'type' => 'required|in:personal,business,unlimited',
            'description' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar si ya existe una licencia de este tipo para el modelo
        $exists = License::where('model_id', $request->model_id)
            ->where('type', $request->type)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una licencia de tipo ' . $request->type . ' para este modelo'
            ], 409);
        }

        $license = License::create([
            'model_id' => $request->model_id,
            'type' => $request->type,
            'description' => $request->description
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Licencia creada exitosamente',
            'data' => $license->load('model:id,name')
        ], 201);
    }

    /**
     * Crear licencia para un modelo específico (admin)
     * POST /api/admin/models/{modelId}/licenses
     */
    public function storeForModel(Request $request, $modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:personal,business,unlimited',
            'description' => 'required|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar si ya existe
        $exists = License::where('model_id', $modelId)
            ->where('type', $request->type)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una licencia de tipo ' . $request->type . ' para este modelo'
            ], 409);
        }

        $license = License::create([
            'model_id' => $modelId,
            'type' => $request->type,
            'description' => $request->description
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Licencia creada para el modelo',
            'data' => $license
        ], 201);
    }

    /**
     * Actualizar licencia (admin)
     * PUT /api/admin/licenses/{id}
     */
    public function update(Request $request, $id)
    {
        $license = License::find($id);

        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Licencia no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:personal,business,unlimited',
            'description' => 'sometimes|string|min:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Si cambia el tipo, verificar que no exista ya
        if ($request->has('type') && $request->type !== $license->type) {
            $exists = License::where('model_id', $license->model_id)
                ->where('type', $request->type)
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una licencia de tipo ' . $request->type . ' para este modelo'
                ], 409);
            }
        }

        $license->update($request->only(['type', 'description']));

        return response()->json([
            'success' => true,
            'message' => 'Licencia actualizada',
            'data' => $license->fresh('model:id,name')
        ]);
    }

    /**
     * Eliminar licencia (admin)
     * DELETE /api/admin/licenses/{id}
     */
    public function destroy($id)
    {
        $license = License::find($id);

        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Licencia no encontrada'
            ], 404);
        }

        // Verificar si hay user_licenses usando esta licencia
        $hasUsers = \DB::table('user_licenses')
            ->where('model_id', $license->model_id)
            ->where('license_type', $license->type)
            ->exists();

        if ($hasUsers) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: hay usuarios con esta licencia'
            ], 409);
        }

        $license->delete();

        return response()->json([
            'success' => true,
            'message' => 'Licencia eliminada correctamente'
        ]);
    }

    /**
     * Listar todas las licencias (admin)
     * GET /api/admin/licenses
     */
    public function adminIndex(Request $request)
    {
        $query = License::with('model:id,name');

        // Filtro por modelo
        if ($request->has('model_id')) {
            $query->where('model_id', $request->model_id);
        }

        // Filtro por tipo
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $licenses = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $licenses
        ]);
    }
}