const validator = require('validator');

const adminCheckSendSettingValueData = (data) => {
    if(data === undefined || data === null) {
        throw new Error('Something went wrong. Please try again in a few seconds.');
    } else if(data.setting === undefined || data.setting === null || typeof data.setting !== 'string' || data.setting.length >= 100 || validator.isAlphanumeric(data.setting, 'en-US', { ignore: '.' }) !== true) {
        throw new Error('Your entered setting is invalid.');
    } else if(data.value === undefined || data.value === null) {
        throw new Error('Your entered value is invalid.');
    } else {
        // Allow special non-boolean settings
        if(data.setting === 'general.reward.multiplier' && typeof data.value === 'string') { return; }
        if(data.setting === 'chat.mode' && typeof data.value === 'string') { return; }
        if(data.setting === 'limited.allowedPets' && Array.isArray(data.value) === true) { return; }
        if(data.setting === 'limited.allowedPetCounts' && (typeof data.value === 'object' && data.value !== null)) { return; }

        // Default boolean check for other settings
        if(typeof data.value !== 'boolean') {
            throw new Error('Your entered value is invalid.');
        }
    }
}

module.exports = {
    adminCheckSendSettingValueData
}
