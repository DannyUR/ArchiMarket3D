<?php

/**
 * @OA\Info(
 *     title="ArchiMarket3D API",
 *     version="1.0.0",
 *     description="API para plataforma de modelos 3D"
 * )
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Servidor local"
 * )
 * @OA\PathItem(
 *     path="/api"
 * )
 */

/**
 * @OA\Get(
 *     path="/test",
 *     summary="Endpoint de prueba",
 *     tags={"Test"},
 *     @OA\Response(
 *         response=200,
 *         description="OK",
 *         @OA\JsonContent(
 *             @OA\Property(property="message", type="string", example="API funcionando")
 *         )
 *     )
 * )
 */