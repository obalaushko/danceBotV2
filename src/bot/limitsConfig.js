// Outgoing Global Throttler
const globalConfig = {
    reservoir: 30,
    reservoirRefreshAmount: 30,
    reservoirRefreshInterval: 1500, // interval in milliseconds where reservoir will refresh
};
// Outgoing Group Throttler
const groupConfig = {
    maxConcurrent: 1,
    minTime: 1000,
    reservoir: 20,
    reservoirRefreshAmount: 20,
    reservoirRefreshInterval: 60000, // interval in milliseconds where reservoir will refresh
};
// Outgoing Private Throttler
const outConfig = {
    maxConcurrent: 1,
    minTime: 1500, // wait this many milliseconds to be ready, after a job
};
export { globalConfig, groupConfig, outConfig };
