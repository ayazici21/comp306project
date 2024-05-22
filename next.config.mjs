/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals = [...config.externals, 'bcrypt'];
        return config;
        },
    env: {
        customKey: "JWT_SECRET"
    }
};

export default nextConfig;
