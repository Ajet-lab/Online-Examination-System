// =========================================
// API REQUEST HELPER
// =========================================

async function apiRequest(url, options = {}) {

    const requestOptions = {

        ...options,

        headers: {

            ...(options.headers || {}),

            "Authorization":
                `Bearer ${token}`

        }

    };


    const response =
        await fetch(
            `${API_BASE_URL}${url}`,
            requestOptions
        );


    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        alert(
            data.message ||
            "You are not authorized to perform this action."
        );

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "admin-login.html";

        throw new Error(
            "Authentication failed"
        );
    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );
    }


    return data;
}
