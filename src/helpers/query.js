exports.sqlQueryMap = ({limit=20, offset=0, page=1, description_length=200}) => ({
    limit: Number(limit) || undefined,
    offset: Number(offset) || undefined,
    page: Number(page) || undefined,
    description_length: Number(description_length) || undefined,
})