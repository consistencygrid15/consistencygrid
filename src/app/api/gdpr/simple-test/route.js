/**
 * GET /api/gdpr/simple-test
 * Super simple test - just return success
 */
export async function GET(req) {
  console.log('[SIMPLE TEST] API endpoint called!');
  return Response.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
}
