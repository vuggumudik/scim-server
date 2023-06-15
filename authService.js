function authenticate(key) {
    if (key) {
        return true;
    } else {
        return false;
    }
}

function getTenant(key) {
    return "tenant1"
}

export  {
    authenticate,
    getTenant
}

