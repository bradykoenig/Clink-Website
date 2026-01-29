export async function geocodeZip(zip) {
  if (!/^\d{5}$/.test(zip)) {
    throw new Error("Invalid ZIP code");
  }

  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) {
    throw new Error("ZIP code not found");
  }

  const data = await res.json();

  return {
    lat: Number(data.places[0].latitude),
    lng: Number(data.places[0].longitude),
  };
}
