import express from 'express';

const router = express.Router();

function formatLocationLabel(result) {
  if (!result || typeof result !== 'object') {
    return 'Location unavailable';
  }

  return result.city ?? result.town ?? result.village ?? result.municipality ?? result.county ?? result.state ?? result.country ?? 'Location unavailable';
}

router.get('/location', async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MindScope/1.0 (local development)',
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Unable to resolve location.' });
    }

    const payload = await response.json();
    const nearestPlace = payload?.address ?? null;

    return res.status(200).json({
      locationLabel: formatLocationLabel(nearestPlace),
      place: nearestPlace,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to resolve location.',
    });
  }
});

export default router;