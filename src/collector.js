const Collector = {
    records : [],
    collecting : false,
    start() {
        this.records = [];
        this.collecting = true;
    },
    stop() {
        this.collecting = false;
        return this.records;
    },
    add( data ) {
        this.collecting && this.records.push( data );
    }
};

export default Collector;
