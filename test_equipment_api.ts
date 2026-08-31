const fetchEquipment = async () => {
  try {
    const response = await fetch('/api/equipment', {
      cache: 'no-store', 
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    console.log('Equipment data:', data);
    return data;
  } catch (err) {
    console.error('Error fetching equipment:', err);
  }
};

fetchEquipment();
