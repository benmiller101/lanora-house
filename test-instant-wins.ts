import fetch from 'node-fetch';

async function testInstantWins() {
  try {
    // Test instant wins endpoint
    console.log("Testing instant wins API...");
    
    const response = await fetch('http://localhost:5000/api/instant-wins', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    console.log("Response status:", response.status);
    const data = await response.text();
    console.log("Response data:", data);

    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log("Instant wins found:", jsonData.length);
      jsonData.forEach((win: any, index: number) => {
        console.log(`${index + 1}. £${win.prizeAmount} ${win.prizeType} - ${win.claimed ? 'CLAIMED' : 'UNCLAIMED'}`);
      });
    }
    
  } catch (error) {
    console.error("Error testing instant wins:", error);
  }
}

testInstantWins();