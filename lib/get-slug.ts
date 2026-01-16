const getSlug = (path: string): string => path.replace(/^\/+|\/+$/g, "");

export default getSlug;