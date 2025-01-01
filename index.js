import { publicClient } from "./client.js";
import { parse } from "csv-parse";
import fs from "fs";
import { formatEther } from "viem";
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

// Initialize CSV writer with headers
const csvWriter = createCsvWriter({
    path: './result.csv',
    header: [
        { id: 'hash', title: 'Hash' },
        { id: 'from', title: 'From' },
        { id: 'to', title: 'To' },
        { id: 'value', title: 'Value (ETH)' }
    ],
    append: true 
});

const txHash = [];

fs.createReadStream("./txHash.csv")
    .pipe(parse({ delimiter: "," }))
    .on("data", (row) => {
        txHash.push(row[0]);
    })
    .on("end", async () => {
        for (const tx of txHash) {
            try {
                const txInfo = await publicClient.getTransaction({ hash: tx });

                await csvWriter.writeRecords([{
                    hash: txInfo.hash,
                    from: txInfo.from,
                    to: txInfo.to,
                    value: formatEther(BigInt(txInfo.value))
                }]);

                console.log(`Transaction ${tx} added successfully!`);
            } catch (error) {
                console.error(`Error processing transaction ${tx}:`, error.message);
            }
        }

        console.log("All transactions processed.");
    })
    .on("error", (err) => {
        console.error("Error reading input CSV:", err.message);
    });
