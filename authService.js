function authenticate(key) {
    if (key) {
        return true;
    } else {
        return false;
    }
}

function getTenant(key) {
    return "test-tenant"
}

export  {
    authenticate,
    getTenant
}

