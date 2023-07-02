import * as yup from 'yup';
import NextLink from 'next/link'
import { yupResolver } from '@hookform/resolvers/yup';
import { format, startOfMonth } from 'date-fns';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Box, Flex, IconButton, Input, Link, Select, Td, Text, Tooltip, Tr, useDisclosure, useToast } from "@chakra-ui/react";
import { DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import Lottie from "lottie-react";

import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import LottieNoPictures from '../../assets/astronaut.json';
import { TableRecords } from '../../components/Tables/TableRecords';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { ModalDeleteRecord } from '../../components/Modal/ModalDeleteRecord';

const FiltersSchema = yup.object().shape({
    department: yup.number(),
	id: yup.string().nullable(),
    user: yup.number().required(),
    endDate: yup.date().required(),
	startDate: yup.date().required(),
});

interface IFilterForm {
    id?: number;
    endDate?: any;
    startDate?: any;
    user?: number | null;
    department?: number | null;
}

interface IRecordsData {
    records: {
        id: number;
        creator: string;
        creator_id: number;
        department: string;
        department_id: number;
        status: string;
        status_id: number;
        pictures: number;
        created_at: string;
    }[];
    departments: {
        id: number;
        department: string;
    }[];
    users: {
        id: number;
        user: string;
    }[];
}

export default function Records() {
    const toast = useToast();
    const { signOut } = useAuth();
    const [currentRecord, setCurrentRecord] = useState(0);
    const [loadings, setLoading] = useState({ findRecords: false });
    const { isOpen: isOpenDeleteRecord, onClose: onCloseDeleteRecord, onOpen: onOpenDeleteRecord } = useDisclosure();
    const [records, setRecords] = useState<IRecordsData>({ records: [], departments: [], users: [] } as IRecordsData);
    const inputDate = { start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') };

    const { register, handleSubmit, formState: { errors: errorsForm }, reset } = useForm({
		resolver: yupResolver(FiltersSchema)
	});

    const onSubmit: SubmitHandler<IFilterForm> = async ({ id, startDate, endDate, department, user }) => {
        const dateFormatteds = {
            start: format(startDate, 'yyyy-MM-dd'),
            end: format(endDate, 'yyyy-MM-dd'),
        }
        const query = `id=${id}&department=${department}&user=${user}&startDate=${dateFormatteds.start}&endDate=${dateFormatteds.end}`;

        getRecords(query);
    }

    async function getRecords(query: string) {
        try {
            setLoading(oldState => ({ ...oldState, findRecords: true }));
            const { data } = await api.get<IRecordsData>(`/web/records?${query}`);
            setRecords(data);
        } catch (error: any) {
            const status = error?.response?.status
            
            if(status === 401) {
                signOut()
                toast({
                    description: 'Seu acesso expirou, realize o login novamente.',
                    status: 'warning',
                    duration: 4000
                });
                return
            }

            toast({
                description: 'Houve um erro ao recuperar os registros, contate o T.I.',
                status: 'error',
                duration: 4000
            });
        } finally {
            setLoading(oldState => ({ ...oldState, findRecords: false }));
        }
    }

    function openModalDeleteRecord(id: number) {
        const currentItem = records.records.find(item => id == item.id);

        if(currentItem?.status_id != 2) {
            toast({
                duration: 4500,
                status: 'warning',
                description: 'Você não pode apagar um registro que não esteja finalizado. Apague o registro pelo celular ou altere seu status para finalizado'
            })
            return
        }

        setCurrentRecord(id);
        onOpenDeleteRecord();
    }

    function deleteRecordInList(id: number) {
        const newListRecords = records.records.filter(item => item.id != id);
        const newList = {
            ...records,
            records: newListRecords
        } as IRecordsData;

        setRecords(newList);
    }

    useEffect(() => {
        getRecords(`id=0&department=0&user=0&startDate=${inputDate.start}&endDate=${inputDate.end}`);
    },[])

    return (
        <Box>
            <Sidebar />

            <Flex w="100%" direction="column">
                <Header title="Registros" />

                <Box bgColor="white" borderRadius={6} m={4} p={4}>
                    <form id="formFilter" onSubmit={handleSubmit(onSubmit)}>
                        <Flex w="100%" gap={2} wrap="wrap" mb={5} mt={2}>
                            <Input
                                disabled={loadings.findRecords}
                                {...register('id')}
                                type="number"
                                maxW="80px"
                                placeholder="ID"
                            />
                            <Input
                                w="fit-content"
                                disabled={loadings.findRecords}
                                {...register('startDate')}
                                type="date" 
                                defaultValue={inputDate.start} 
                            />
                            <Input
                                w="fit-content"
                                disabled={loadings.findRecords}
                                {...register('endDate')}
                                type="date" 
                                defaultValue={inputDate.end} 
                                max={format(new Date(), 'yyyy-MM-dd')}
                            />
                            <Select disabled={loadings.findRecords} w="fit-content" {...register('department')} defaultValue={0}>
                                <option value={0}>Todos setores</option>
                                {records?.departments?.map(item => (
                                    <option key={item.id} value={item.id}>{item.department}</option>
                                ))}
                            </Select>
                            <Select disabled={loadings.findRecords} w="fit-content" {...register('user')} defaultValue={0}>
                                <option value={0}>Todos usuários</option>
                                {records?.users?.map(item => (
                                    <option key={item.id} value={item.id}>{item.user}</option>
                                ))}
                            </Select>

                            <IconButton
                                form="formFilter"
                                aria-label="Botão de busca"
                                type="submit"
                                colorScheme="green"
                                isLoading={loadings.findRecords}
                                icon={<SearchIcon />}
                            />
                        </Flex>
                    </form>

                    {records.records.length == 0 ? <Flex justify="center" direction="column" align="center">
                        <Box w={350} mt={50}>
                            <Lottie
                                animationData={LottieNoPictures}
                            />
                        </Box>
                        <Text mt={4}>Nenhum registro foi encontrado</Text>
                    </Flex> :
                    <TableRecords
                        headers={['#', 'Usuário', 'Setor', 'Quantidade de fotos', 'Status', 'Criado em', ' ']}
                    >
                        {records.records.map(item => (
                            <Tr key={item.id}>
                                <Td>{item.id}</Td>
                                <Td>{item.creator}</Td>
                                <Td>{item.department}</Td>
                                <Td>{item.pictures}</Td>
                                <Td>{item.status}</Td>
                                <Td>{item.created_at}</Td>
                                <Td align="right">
                                    <Flex justify="flex-end" gap={4}>
                                        <IconButton
                                            colorScheme="red"
                                            icon={<DeleteIcon />}
                                            aria-label="Deletar item"
                                            disabled={item.status_id != 2}
                                            onClick={() => openModalDeleteRecord(item.id)}
                                        />
                                        <NextLink href={`records/${item.id}`} passHref>
                                            <Link cursor="pointer">
                                                <IconButton
                                                    size="md"
                                                    colorScheme="green"
                                                    icon={<FiChevronRight style={{ width: 22, height: 22 }} />}
                                                    aria-label={`Abrir registro n°${item.id}`}
                                                />
                                            </Link>
                                        </NextLink>
                                    </Flex>
                                </Td>
                            </Tr>
                        ))}
                    </TableRecords>}
                </Box>
            </Flex>
            
            <ModalDeleteRecord 
                id={currentRecord}
                isOpen={isOpenDeleteRecord}
                onClose={onCloseDeleteRecord}
                updateList={deleteRecordInList}
            />
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { 'sol.token': token } = parseCookies(ctx);

    const url = ctx.resolvedUrl;
    
    if(!token) {
        return {
            redirect: {
                destination: !!url ? `/?url=${url}` : '/',
                permanent: false

            }
        }
    }

    return {
        props: {}
    }
}