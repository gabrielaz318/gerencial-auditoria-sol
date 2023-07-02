import { Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { ReactNode } from "react";

interface ITableRecords {
    mainHeader: string;
    children: ReactNode;
}

export function TableParameters({ children, mainHeader }: ITableRecords) {
    return (
        <TableContainer>
            <Table variant='simple' size="sm">
                <Thead>
                    <Tr>
                        <Th>#</Th>
                        <Th w="100%">{mainHeader}</Th>
                        <Th>Ação</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {children}
                </Tbody>
            </Table>
        </TableContainer>
    )
}