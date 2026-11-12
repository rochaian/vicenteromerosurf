// Función serverless de Vercel: GET /api/videos
// Lee el feed público del canal de YouTube (sin API key) y devuelve los últimos vídeos.
// La respuesta se cachea 1 h en el CDN de Vercel, así el sitio se actualiza solo.
const CHANNEL_ID = 'UCGpGHKYmtyf7PyhKYp7Qxyw'; // youtube.com/user/blsvicente
const FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL_ID;

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

module.exports = async (req, res) => {
  try {
    const r = await fetch(FEED);
    if (!r.ok) throw new Error('YouTube ' + r.status);
    const xml = await r.text();
    const videos = xml.split('<entry>').slice(1).map((entry) => ({
      id: (entry.match(/<yt:videoId>([^<]+)</) || [])[1],
      title: decode((entry.match(/<title>([^<]*)</) || [])[1] || ''),
      published: (entry.match(/<published>([^<]+)</) || [])[1]
    })).filter((v) => v.id);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ videos });
  } catch (err) {
    // El navegador usa /assets/data/videos.json como respaldo si esto falla.
    res.status(502).json({ videos: [], error: String(err.message || err) });
  }
};
