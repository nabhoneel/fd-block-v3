import React, { useState } from "react";
import { Table, Pagination, TextInput, Tooltip } from "flowbite-react";

import DashboardLayout from "../../components/dashboard-layout";
import BlockDirectory from "../../assets/data/members.json";

const BlockDir = () => {
    const number_of_entries_per_page = 10;
    const [page_number, SetPageNumber] = useState(1);
    const [current_entries, SetCurrentEntries] = useState(BlockDirectory);
    const [filter_string, SetFilterString] = useState("");

    // The members.json file contains the plot numbers in the following format: 219-8
    // We need to change these to: FD 219/8
    const ProcessPlotNumber = plot_number => {
        const plot_number_segments = plot_number.split("-");
        let plot_number_str = "";
        if (plot_number_segments.length === 1) {
            plot_number_str = plot_number_segments[0];
        } else {
            plot_number_str = plot_number_segments[0] + "/" + plot_number_segments[1];
        }

        return "FD " + plot_number_str;
    };

    // Creates the entries in the table (frontend)
    let table_rows = [];
    if (current_entries.length > 0) {
        const start_from = (page_number - 1) * number_of_entries_per_page;
        const end_at = Math.min(start_from + number_of_entries_per_page, current_entries.length);
        for (let idx = start_from; idx < end_at; idx++) {
            const entry = current_entries[idx];
            table_rows.push(
                <Table.Row key={Math.random()} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{entry.name}</Table.Cell>
                    <Table.Cell>{entry.phoneNumber}</Table.Cell>
                    <Table.Cell>{ProcessPlotNumber(entry.plotNumber)}</Table.Cell>
                </Table.Row>
            );
        }
    }

    // Update the list of available entries (kinda slow, but okay for ~500 entries in total)
    const HandleFilterStringChange = e => {
        const f = e.target.value;
        let temp_entries = BlockDirectory.filter(entry => {
            const pn = ProcessPlotNumber(entry.plotNumber);
            if (entry.name.toUpperCase().indexOf(f.toUpperCase()) > -1 || entry.phoneNumber.indexOf(f) > -1 || pn.indexOf(f) > -1) {
                return true;
            }

            return false;
        });

        SetFilterString(f);
        SetCurrentEntries(temp_entries);
        SetPageNumber(temp_entries.length > 0 ? 1 : 0);
    };

    const total_num_of_pages = Math.ceil(current_entries.length / number_of_entries_per_page);
    return (
        <DashboardLayout>
            <div className="mt-3 flex flex-col justify-center flex-auto">
                <div className="flex justify-between">
                    <span className="pl-2 text-2xl">FD Block Members' Directory</span>
                    <div className="mb-5">
                        <Tooltip content="Search by name, phone-number, flat-number" placement="top">
                            <TextInput placeholder="Search" value={filter_string} onChange={HandleFilterStringChange} />
                        </Tooltip>
                    </div>
                </div>
                <Table hoverable={true}>
                    <Table.Head>
                        <Table.HeadCell>Member Name</Table.HeadCell>
                        <Table.HeadCell>Contact Number</Table.HeadCell>
                        <Table.HeadCell>Plot Number</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">{table_rows}</Table.Body>
                </Table>
                <div className="flex flex-col items-center justify-center text-center mt-7">
                    <span className="">
                        Page {page_number} of {total_num_of_pages}
                    </span>
                    <Pagination currentPage={page_number} layout="navigation" onPageChange={SetPageNumber} showIcons={true} totalPages={total_num_of_pages} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BlockDir;
