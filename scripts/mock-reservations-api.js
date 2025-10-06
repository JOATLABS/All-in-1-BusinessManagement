#!/usr/bin/env node
/* eslint-disable no-console */
const http = require('node:http');
const path = require('node:path');
const { readFileSync } = require('node:fs');

const port = Number(process.env.MOCK_API_PORT ?? 4000);

const resolveJson = (relativePath) => {
  const fullPath = path.resolve(__dirname, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8'));
};

let siteContent;
try {
  siteContent = resolveJson('../backend/data/siteContent.json');
} catch (error) {
  console.warn('Falling back to frontend defaults for site content:', error);
  siteContent = resolveJson('../frontend/public/site-content.json');
}

const availability = {
  summary: {
    total: siteContent.reservation.tableTiers.reduce((total, tier) => total + tier.total, 0),
    baseReserved: siteContent.reservation.tableTiers.reduce((total, tier) => total + tier.reserved, 0),
    confirmed: 0,
    available: siteContent.reservation.tableTiers.reduce(
      (total, tier) => total + (tier.total - Math.min(tier.reserved, tier.total)),
      0
    )
  },
  tiers: siteContent.reservation.tableTiers.map((tier) => ({
    tierId: tier.id,
    total: tier.total,
    baseReserved: Math.min(tier.reserved, tier.total),
    confirmed: 0,
    available: Math.max(tier.total - tier.reserved, 0)
  }))
};

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/v1/site-content') {
    sendJson(res, 200, siteContent);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/v1/reservations/availability') {
    sendJson(res, 200, availability);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/v1/reservations') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      console.log('Reservation payload:', body);
      sendJson(res, 200, {
        reservationId: 'mock-reservation',
        confirmationCode: 'VIP-MOCK-QR'
      });
    });
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Mock reservations API listening on http://127.0.0.1:${port}`);
});
