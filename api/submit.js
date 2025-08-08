export default async function handler(req, res) {
  // Allow requests from your Webflow domain
  res.setHeader('Access-Control-Allow-Origin', 'https://your-webflow-site.webflow.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Pre-flight request handling
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const PIPEDRIVE_TOKEN = process.env.PIPEDRIVE_TOKEN;
  const apiUrl = `https://api.pipedrive.com/v1/persons?api_token=${PIPEDRIVE_TOKEN}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: [{ value: email, primary: true }],
        phone: phone ? [{ value: phone, primary: true }] : [],
        visible_to: 3, // Optional: Shared visibility
      }),
    });

    const data = await response.json();
    if (!data.success) {
      return res.status(500).json({ error: 'Failed to create person in Pipedrive', details: data });
    }

    return res.status(200).json({ message: 'Person created successfully', data: data });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
