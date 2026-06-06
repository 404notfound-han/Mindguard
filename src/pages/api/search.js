export const prerender = false;

export const GET = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Parameter "id" diperlukan' }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Daftar instance Invidious publik yang stabil sebagai backup
  const instances = [
    "https://invidious.nerdvpn.de",
    "https://yewtu.be",
    "https://inv.nadeko.net",
    "https://invidious.flokinet.to",
  ];

  // Gunakan instance pertama sebagai jalur utama
  const targetInstance = instances[0];

  try {
    // 1. Ambil metadata video dari API Invidious publik
    const apiUrl = `${targetInstance}/api/v1/videos/${id}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      throw new Error("Gagal mengambil metadata dari proxy stream");
    }

    const data = await res.json();

    // 2. Saring format yang hanya berisi audio (audioOnly)
    const audioStreams = data.adaptiveFormats?.filter((f) =>
      f.type?.startsWith("audio/"),
    );
    const directAudioUrl = audioStreams?.[0]?.url;

    if (!directAudioUrl) {
      throw new Error("Format audio tidak ditemukan pada video ini");
    }

    // 3. Tarik data audionya lewat fetch internal server backend Astro
    const audioResponse = await fetch(directAudioUrl);

    if (!audioResponse.ok) {
      throw new Error("Gagal melakukan streaming audio dari cluster Google");
    }

    // 4. Alirkan stream-nya langsung ke browser lo (Bebas dari masalah CORS)
    return new Response(audioResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/webm",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Sistem Stream Error:", error.message);

    // Fallback darurat: Jika fetch stream gagal, oper langsung rute redirect publik ke browser
    return Response.redirect(
      `${targetInstance}/latest_version?id=${id}&itag=251`,
      307,
    );
  }
};
