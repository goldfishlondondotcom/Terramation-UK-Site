import 'dotenv/config';

const apiKey = process.env.BREVO_API_KEY;
const listId = process.env.BREVO_LIST_ID;

console.log('API Key set:', !!apiKey);
console.log('List ID:', listId);

if (apiKey && listId) {
  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email: 'test@example.com',
      listIds: [parseInt(listId)],
      updateEnabled: true,
    }),
  });

  console.log('Status:', response.status);
  console.log('Response:', await response.text());
}