const getPaginationParams = (req, options = {}) => {
    try {
        // pagination default configs
        const DEFAULT_LIMIT = options.defaultLimit || 3;
        const MAX_LIMIT = options.maxLimit || 5;

        let page = parseInt(req.query.page, 10);
        let limit = parseInt(req.query.limit, 10);

        // checks default values invalid or missing
        page = isNaN(page) || page < 1 ? 1 : page;
        limit = isNaN(limit) || limit < 1 ? DEFAULT_LIMIT : limit;


        if (limit > MAX_LIMIT) limit = MAX_LIMIT;

        const skip = (page - 1) * limit;
        return { page, limit, skip };
    } catch (error) {
        console.error("Pagination error:", error);

    }
}

module.exports = getPaginationParams;