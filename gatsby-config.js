require("dotenv").config();
module.exports = {
    siteMetadata: {
        title: `fdblock.org`,
        siteUrl: `https://www.yourdomain.tld`,
    },
    plugins: [
        "gatsby-plugin-postcss",
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: "fdblock.org",
                short_name: "fdblock.org",
                start_url: "/",
                icon: "src/assets/images/fdblock.png",
            },
        },
    ],
    flags: {
        DEV_SSR: false,
    },
};
