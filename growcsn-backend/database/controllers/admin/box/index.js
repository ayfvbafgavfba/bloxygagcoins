const path = require('path');
const slugify = require('slugify');

// Load database models
const Box = require('../../../database/models/Box');

// Load external data
const petValues = require(path.join(__dirname, '..', '..', '..', 'growcsn-frontend', 'src', 'assets', 'pet-values.json'));

// Load utils
const {
    socketRemoveAntiSpam
} = require('../../../utils/socket');
const {
    adminCheckGetBoxListData,
    adminCheckSendBoxCreateData,
    adminCheckSendBoxCreateItems,
    adminCheckSendBoxRemoveData,
    adminCheckSendBoxRemoveBox,
    adminSaveImage,
    adminGetAmountBox,
    adminGetGag2ItemById,
    adminNormalizeGag2Item
} = require('../../../utils/admin/box');

const adminGetBoxListSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        adminCheckGetBoxListData(data);

        // Calculating database query offset
        const offset = (data.page - 1) * 12;

        // Get boxes, boxes count and pet item list from GAG2 values
        const dataDatabase = await Promise.all([
            Box.countDocuments({
                name: { $regex: data.search, $options: 'i' }
            }),
            Box.find({
                name: { $regex: data.search, $options: 'i' }
            }).sort({ createdAt: -1 }).limit(12).skip(offset).select('name amount items categories state createdAt').lean()
        ]);

        const items = Array.isArray(petValues.items)
            ? petValues.items.map((value) => ({
                _id: value.slug || (value.variants && value.variants.length > 0 ? value.variants[0].id : value.name),
                name: value.display_name || value.name,
                image: value.image_url
                    ? value.image_url.startsWith('http')
                        ? value.image_url
                        : 'https://values.roflips.com' + (value.image_url.startsWith('/') ? '' : '/') + value.image_url
                    : '',
                amountFixed: value.variants && value.variants.length > 0 ? Number(value.variants[0].tokens || 0) : Number(value.variant_tokens?.Normal || 0)
            }))
            : [];

        callback({ success: true, count: dataDatabase[0], boxes: dataDatabase[1], items: items });
    } catch(err) {
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const adminSendBoxCreateSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        adminCheckSendBoxCreateData(data);

        // Validate sent items
        adminCheckSendBoxCreateItems(data);

        // Get box amount
        const amountBox = adminGetAmountBox(data);

        // Normalize GAG2 item payload for storage
        const normalizedItems = data.items.map((item) => {
            const gag2Item = adminGetGag2ItemById(item.item);
            return {
                item: adminNormalizeGag2Item(gag2Item),
                tickets: item.tickets
            };
        });

        // Get name slug
        const slug = slugify(data.name, { lower: true });

        // Save box image if provided
        if(data.image !== undefined && data.image !== null && typeof data.image === 'string' && data.image.trim() !== '') {
            await adminSaveImage(data.image, slug);
        }

        // Create box in database
        let boxDatabase = await Box.create({
            name: data.name,
            slug: slug,
            amount: amountBox,
            items: normalizedItems,
            categories: data.categories,
            type: 'site',
            state: 'active'
        });

        // Convert box object to javascript object
        boxDatabase = boxDatabase.toObject();

        callback({ success: true, box: boxDatabase });

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(user._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

const adminSendBoxRemoveSocket = async(io, socket, user, data, callback) => {
    try {
        // Validate sent data
        adminCheckSendBoxRemoveData(data);

        // Validate if the box is in database and not active
    const boxDatabase = await Box.findById(data.boxId).select('state').lean();
    adminCheckSendBoxRemoveBox(boxDatabase);

    // Remove box from database
    const removedBox = await Box.findByIdAndDelete(data.boxId);
    callback({ success: true, box: removedBox });

        socketRemoveAntiSpam(user._id);
    } catch(err) {
        socketRemoveAntiSpam(user._id);
        callback({ success: false, error: { type: 'error', message: err.message } });
    }
}

module.exports = {
    adminGetBoxListSocket,
    adminSendBoxCreateSocket,
    adminSendBoxRemoveSocket
}