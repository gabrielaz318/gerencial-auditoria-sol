import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { ReactNode } from "react";

interface ITableRecords {
    headers: string[]
    children: ReactNode;
}

export function TableRecords({ headers, children }: ITableRecords) {
    return (
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        {headers.map((item,index) => <Th key={index}>{item}</Th>)}
                    </Tr>
                </Thead>
                <Tbody>
                    {children}
                </Tbody>
            </Table>
        </TableContainer>
    )
}