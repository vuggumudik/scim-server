// This is a workaround and needs to be fixed in the future. Also, there is probably no need to support all types of
// phones, emails, and addresses. We can just support one of each type.
function addMissingComplexTypes(data) {
    const defaultEmails = [
        { "value": "", "primary": true, "type": "work" },
        { "primary": false, "type": "home" },
        { "primary": false, "type": "other" }
    ];
    const defaultPhoneNumbers = [
        { "type": "work", "primary": true },
        { "type": "home", "primary": false },
        { "type": "mobile", "primary": false }
    ];
    const defaultAddresses = [
        { "type": "work" },
        { "type": "home" },
        { "type": "other" }
    ];

    if (!data.emails) {
        data.emails = defaultEmails;
    } else {
        const missingEmailTypes = defaultEmails.filter(email => !data.emails.find(e => e.type === email.type));
        data.emails.push(...missingEmailTypes);
    }

    if (!data.phoneNumbers) {
        data.phoneNumbers = defaultPhoneNumbers;
    } else {
        const missingPhoneNumberTypes = defaultPhoneNumbers.filter(phone => !data.phoneNumbers.find(p => p.type === phone.type));
        data.phoneNumbers.push(...missingPhoneNumberTypes);
    }

    if (!data.addresses) {
        data.addresses = defaultAddresses;
    } else {
        const missingAddressTypes = defaultAddresses.filter(address => !data.addresses.find(a => a.type === address.type));
        data.addresses.push(...missingAddressTypes);
    }

    // If type is not present, set it to the one that is missing. 
    data.emails.forEach(email => {
        if (!email.type) email.type = "work";
    });
    data.phoneNumbers.forEach(phone => {
        if (!phone.type) phone.type = "work";
    });
    data.addresses.forEach(address => {
        if (!address.type) address.type = "work";
    });

    return data;
}

function cleanUpData(data) {
    // Remove the phonenumbers, emails, and addresses if the value is not present
    if (data.phoneNumbers) {
        data.phoneNumbers = data.phoneNumbers.filter(phone => phone.value);
    };
    if (data.phoneNumbers && data.phoneNumbers.length === 0) delete data.phoneNumbers;
    if (data.emails) {
        data.emails = data.emails.filter(email => email.value);
    }
    if (data.emails && data.emails.length === 0) delete data.emails;
    if (data.addresses) {
        data.addresses = data.addresses.filter(address => address.streetAddress || address.locality || address.region || address.postalCode || address.country);
    }
    if (data.addresses && data.addresses.length === 0) delete data.addresses;
    return data;
}

function fixMissingCanonicalTypes(data) {
    // Define the canonical types for each field
    const canonicalTypes = {
      emails: "work",
      phoneNumbers: "work",
      addresses: "work"
    };
  
    // Iterate over each field and check if type is missing
    for (const field in canonicalTypes) {
      if (data[field]) {
        data[field].forEach(item => {
          if (!item.type) {
            item.type = canonicalTypes[field];
          }
        });
      }
    }
  
    return data;
  }
  

export {
    addMissingComplexTypes,
    cleanUpData,
    fixMissingCanonicalTypes
}