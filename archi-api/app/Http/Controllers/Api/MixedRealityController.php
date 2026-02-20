<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MixedReality;
use App\Models\Model3D;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MixedRealityController extends Controller
{
    /**
     * Obtener configuración de realidad mixta de un modelo (público)
     */
    public function show($modelId)
    {
        $model = Model3D::find($modelId);

        if (!$model) {
            return response()->json([
                'message' => 'Modelo no encontrado'
            ], 404);
        }

        $mr = MixedReality::where('model_id', $modelId)->first();

        if (!$mr) {
            return response()->json([
                'message' => 'Este modelo no tiene configuración de realidad mixta',
                'model_id' => $modelId
            ], 404);
        }

        return response()->json([
            'model_id' => $mr->model_id,
            'compatible' => $mr->compatible,
            'platform' => $mr->platform,
            'notes' => $mr->notes,
            'model_name' => $model->name
        ]);
    }

    /**
     * Crear configuración de realidad mixta (admin)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'model_id' => 'required|exists:models,id|unique:mixed_reality,model_id',
            'compatible' => 'sometimes|boolean',
            'platform' => 'required|in:HoloLens,ARCore,ARKit,WebXR,Unity,Unreal,MetaQuest',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $mr = MixedReality::create([
            'model_id' => $request->model_id,
            'compatible' => $request->compatible ?? true,
            'platform' => $request->platform,
            'notes' => $request->notes
        ]);

        return response()->json([
            'message' => 'Configuración de realidad mixta creada',
            'mixed_reality' => $mr
        ], 201);
    }

    /**
     * Actualizar configuración de realidad mixta (admin)
     */
    public function update(Request $request, $id)
    {
        $mr = MixedReality::find($id);

        if (!$mr) {
            return response()->json([
                'message' => 'Configuración no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'compatible' => 'sometimes|boolean',
            'platform' => 'sometimes|in:HoloLens,ARCore,ARKit,WebXR,Unity,Unreal,MetaQuest',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $mr->update($request->only(['compatible', 'platform', 'notes']));

        return response()->json([
            'message' => 'Configuración actualizada',
            'mixed_reality' => $mr->fresh()
        ]);
    }

    /**
     * Eliminar configuración de realidad mixta (admin)
     */
    public function destroy($id)
    {
        $mr = MixedReality::find($id);

        if (!$mr) {
            return response()->json([
                'message' => 'Configuración no encontrada'
            ], 404);
        }

        $mr->delete();

        return response()->json([
            'message' => 'Configuración de realidad mixta eliminada'
        ]);
    }
}