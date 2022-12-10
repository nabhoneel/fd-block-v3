import React, { useState } from "react";
import { Table, Pagination, TextInput, Tooltip } from "flowbite-react";

import DashboardLayout from "../../components/dashboard-layout";
import BlockDirectory from "../../assets/data/members.json";

const BlockDir = () => {
    const number_of_entries_per_page = 10;
    const [page_number, SetPageNumber] = useState(1);
    const [current_entries, SetCurrentEntries] = useState(BlockDirectory);
    const [filter_string, SetFilterString] = useState();

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

    const start_from = (page_number - 1) * number_of_entries_per_page;
    const end_at = Math.min(start_from + number_of_entries_per_page, current_entries.length);
    let table_rows = [];
    for (let idx = start_from; idx < end_at; idx++) {
        const entry = current_entries[idx];
        table_rows.push(
            <Table.Row key={Math.random()} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">{entry.name}</Table.Cell>
                <Table.Cell>{entry.phoneNumber}</Table.Cell>
                <Table.Cell>{ProcessPlotNumber(entry.plotNumber)}</Table.Cell>
                <Table.Cell>
                    <button href="/tables" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                        View
                    </button>
                </Table.Cell>
            </Table.Row>
        );
    }

    const HandleFilterStringChange = e => {
        SetFilterString(e.target.value);
    };

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
                        <Table.HeadCell>
                            <span className="sr-only">View</span>
                        </Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">{table_rows}</Table.Body>
                </Table>
                <div className="flex flex-col items-center justify-center text-center mt-7">
                    <span className="">
                        Page {page_number} of {current_entries.length / number_of_entries_per_page}
                    </span>
                    <Pagination currentPage={page_number} layout="navigation" onPageChange={SetPageNumber} showIcons={true} totalPages={current_entries.length / number_of_entries_per_page} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BlockDir;
