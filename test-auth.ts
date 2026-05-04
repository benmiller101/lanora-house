// Quick auth test
async function testAuth() {
  try {
    // Test guest login
    const loginResponse = await fetch('http://localhost:5000/api/auth/guest-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User'
      }),
      credentials: 'include'
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login response:', loginData);
    
    // Test get user
    const userResponse = await fetch('http://localhost:5000/api/auth/user', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('User response status:', userResponse.status);
    const userData = await userResponse.text();
    console.log('User response:', userData);
    
    // Test add to wishlist
    const wishlistResponse = await fetch('http://localhost:5000/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 1
      }),
      credentials: 'include'
    });
    
    console.log('Wishlist response status:', wishlistResponse.status);
    const wishlistData = await wishlistResponse.text();
    console.log('Wishlist response:', wishlistData);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();