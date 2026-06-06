import ytStream from 'yt-stream';

async function main() {
  ytStream.setPreference('scrape');
  const id = 'lYBUbBu4W08';
  const url = `https://www.youtube.com/watch?v=${id}`;
  
  try {
    const info = await ytStream.getInfo(url);
    console.log('Title:', info.title);
    console.log('Formats count:', info.formats ? info.formats.length : 0);
    if (info.formats && info.formats.length > 0) {
      console.log('First format keys:', Object.keys(info.formats[0]));
      console.log('First format mimeType:', info.formats[0].mimeType);
      console.log('First format url:', info.formats[0].url);
    }
  } catch (err) {
    console.error('getInfo error:', err);
  }
}

main();
