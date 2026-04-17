const backendUrl = import.meta.env.VITE_BACKEND_URL;

const loginApi = async (email: string, password: string) => {
  try {
    const response = await fetch(`${backendUrl}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log('data ===>', data);
    return data;
  } catch (error: any) {
    console.error(error);
  }
};

const signUpApi = async (name: string, email: string, role: string, password: string) => {
  try {
    const response = await fetch(`${backendUrl}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, role, password }),
    });
    const data = await response.json();
    console.log('data ===>', data);
    return data;
  } catch (error: any) {
    console.error(error);
  }
};

export { loginApi, signUpApi };
