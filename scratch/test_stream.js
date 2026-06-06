import ytStream from 'yt-stream';

async function main() {
  ytStream.setPreference('scrape');
  
  const id = 'lYBUbBu4W08'; // Rick Astley
  const url = `https://www.youtube.com/watch?v=${id}`;
  console.log('Fetching stream for URL:', url);
  const playStream = await ytStream.stream(url, {
    type: 'audio',
    highWaterMark: 1048576 * 32, // 32MB
    download: true
  });
  
  console.log('Stream retrieved!');
  console.log('type:', playStream.type);
  console.log('mimeType:', playStream.mimeType);
  console.log('container:', playStream.container);
  console.log('content_length:', playStream.content_length);
  
  playStream.destroy();
}

main().catch(console.error);
