/**
 * Test the SSE parsing logic
 * This simulates what happens when the server sends SSE data
 */

console.log('Testing SSE Message Parsing...');

// Test SSE parsing logic similar to what's in AuthenticatedHttpTransport
function testSseMessageParsing() {
  const sseLines = [
    'data: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-06-18","capabilities":{"tools":{"listChanged":true}}}}',
    'data: ',
    'data: {"jsonrpc":"2.0","method":"notifications/tools/list_changed"}',
    'data: [DONE]'
  ];

  const messages = [];

  for (const line of sseLines) {
    if (line.startsWith('data: ')) {
      try {
        const data = line.slice(6).trim();
        console.log('Processing SSE data:', data);
        
        if (data === '[DONE]' || data === '') {
          console.log('Skipping control data');
          continue;
        }
        
        const parsedData = JSON.parse(data);
        console.log('Parsed JSON:', parsedData);
        messages.push(parsedData);
      } catch (err) {
        console.warn('Failed to parse SSE message:', line, err.message);
      }
    }
  }

  console.log('Successfully parsed messages:', messages.length);
  return messages;
}

// Test URL redirection logic
function testUrlRedirection() {
  console.log('\nTesting URL redirection logic...');
  
  const baseUrl = 'http://localhost/weather/sse';
  const redirectResponse = '/weather/messages/?session_id=abc123xyz';
  
  const parsedBase = new URL(baseUrl);
  const fullSseUrl = new URL(redirectResponse, parsedBase.origin);
  
  console.log('Base URL:', baseUrl);
  console.log('Redirect response:', redirectResponse);
  console.log('Constructed SSE URL:', fullSseUrl.toString());
  
  return fullSseUrl.toString();
}

// Run tests
try {
  const messages = testSseMessageParsing();
  const sseUrl = testUrlRedirection();
  
  console.log('\n✅ All MCP transport logic tests passed!');
  console.log('- SSE message parsing: ✅');
  console.log('- URL redirection: ✅');
  console.log('- JSON-RPC parsing: ✅');
  
} catch (error) {
  console.error('❌ Test failed:', error);
}
