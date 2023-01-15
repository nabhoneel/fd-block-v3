///////////////////////////////////
// Rate chart for community hall //
///////////////////////////////////

const event_types = { marriage: "Marriage Ceremony", general: "General Event", funeral: "Funeral" };

const floor_options = {
    marriage: { first_two: "First Two Floors", all: "All Floors" },
    general: { ground: "Ground Floor", first_two: "First Two Floors", all: "All Floors" },
    funeral: { ground: "Ground Floor", first_two: "First Two Floors", all: "All Floors" },
};

const cost_table = {
    non_residents: {
        marriage: { first_two: 70000, all: 85000, security_deposit: 10000 },
        general: { ground: 20000, first_two: 20000 * 2, all: 20000 * 3, security_deposit: 5000 },
        funeral: { ground: 10000, first_two: 10000 * 2, all: 10000 * 3, security_deposit: 3000 },
    },
    residents: {
        marriage: { first_two: 30000, all: 40000, security_deposit: 5000 },
        general: { ground: 10000, first_two: 10000 * 2, all: 10000 * 3, security_deposit: 5000 },
        funeral: { ground: 4000, first_two: 4000 * 2, all: 4000 * 3, security_deposit: 3000 },
    },
};

export { event_types, floor_options, cost_table };
