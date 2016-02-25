var Config = {
    site: {
        title: '艾云博客',
        description: 'loveYun',
        version: '1.0.0'
    },
    db: {
        cookieSecret: 'iyunblogsecret',
        name: 'iyun',
        host: 'localhost',
        url: 'mongodb://127.0.0.1:27017/iyun'
    }
};
module.exports = Config;