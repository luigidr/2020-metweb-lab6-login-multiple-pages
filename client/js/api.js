class Api {
  /**
   * Perform the login
   */
  static doLogin = async (username, password) => {
    let response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
    });
    if(response.ok) {
        const username = await response.json();
        return username;
    }
    else {
        try {
            const errDetail = await response.json();
            throw errDetail.message;
        }
        catch(err) {
            throw err;
        }
    }
  }
}

export default Api;