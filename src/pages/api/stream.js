import ytStream from 'yt-stream';
import { Readable } from 'stream';

export const prerender = false;

// Set preference to scrape to avoid requiring an official YouTube API key
try {
  ytStream.setPreference('scrape');
} catch (e) {
  console.warn('Failed to set yt-stream preference to scrape:', e);
}

export const GET = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Query parameter "id" is required' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${id}`;

    // Get the audio stream from yt-stream
    const playStream = await ytStream.stream(videoUrl, {
      type: 'audio',
      highWaterMark: 1048576 * 16, // 16MB buffer
      download: true,
    });

    if (!playStream || !playStream.stream) {
      throw new Error('Failed to retrieve stream from library');
    }

    // Convert the Node.js Readable stream into a Web ReadableStream
    const webStream = Readable.toWeb(playStream.stream);

    // Prepare response headers
    const headers = {
      'Content-Type': playStream.mimeType || 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };

    if (playStream.content_length && !isNaN(playStream.content_length)) {
      headers['Content-Length'] = String(playStream.content_length);
    }

    return new Response(webStream, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Streaming error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred during streaming' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
