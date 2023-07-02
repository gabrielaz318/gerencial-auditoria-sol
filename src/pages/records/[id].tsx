import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import Lottie from "lottie-react";
import { Box, Button, ButtonGroup, Divider, Editable, EditableInput, EditablePreview, Flex, IconButton, Image, Select, SimpleGrid, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { FiDownloadCloud } from 'react-icons/fi';

import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { api } from "../../services/api";

import LottieLoadingRecordItem from '../../assets/loading-record-items.json';
import LottieNoPictures from '../../assets/astronaut.json';
import { useAuth } from "../../contexts/AuthContext";
import { parseCookies } from "nookies";
import { CloseIcon, DownloadIcon } from "@chakra-ui/icons";
import { ModalDeleteItemRecord } from "../../components/Modal/ModalDeleteItemRecord";
import { ModalChecklist } from "../../components/Modal/ModalChecklist";

interface IRecordsID {
    id: number;
}

export interface IItemsChecklist {
    item: string;
    desc: string;
    grade: number;
};

export interface IGradesChecklist {
    grade: number;
    color: string;
};

export interface IChecklist {
    checklist: {
        title: string;
        items: IItemsChecklist[];
    }[];
    grades: IGradesChecklist[];
    version: string;
}

interface IItemRecord {
    record: {
        id: number;
        creator: string;
        department: string;
        status: string;
        status_id: number;
        pictures: number;
        created_at: string;
        checklist: IChecklist | null;
    },
    items: {
        id: number;
        picture: string;
        comment: string;
        created_at: string;
    }[];
}


export default function RecordsID({ id }: IRecordsID) {
    const toast = useToast();
    const router = useRouter();
    const { signOut } = useAuth();
    const [download, setDownload] = useState('');
    const [currentItem, setCurrentItem] = useState(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [itemRecord, setItemRecord] = useState<IItemRecord>({} as IItemRecord);
    const { isOpen: isOpenDeleteItem, onClose: onCloseDeleteItem, onOpen: onOpenDeleteItem } = useDisclosure();
    const [loadings, setLoadings] = useState({ getItem: false, generatePdfNormal: false, generatePdfEnclosure: false, generateChecklist: false })

    async function getItems() {
        try {
            setLoadings(oldState => ({ ...oldState, getItem: true }));

            const { data } = await api.get<IItemRecord>(`/web/records/items?id=${id}`);
            setItemRecord(data);
        } catch(error: any) {
            const status = error?.status

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
            setLoadings(oldState => ({ ...oldState, getItem: false }));
        }
    }

    async function generatePDF(type: string) {
        try {
            if(type == '1') {
                setLoadings(oldState => ({ ...oldState, generatePdfNormal: true }));
            } else {
                setLoadings(oldState => ({ ...oldState, generatePdfEnclosure: true }));
            }

            const { data } = await api.get(`/web/items/pdf?id=${id}&type=${type}`);
            setDownload(data.url+'?'+new Date().getTime());
        } catch(error) {

            toast({
                description: 'Houve um erro ao recuperar os registros, contate o T.I.',
                status: 'error',
                duration: 4000
            });
        } finally {
            if(type == '1') {
                setLoadings(oldState => ({ ...oldState, generatePdfNormal: false }));
            } else {
                setLoadings(oldState => ({ ...oldState, generatePdfEnclosure: false }));
            }
        }
    }

    async function generateChecklist() {
        try {
            setLoadings(oldState => ({ ...oldState, generateChecklist: true }));

            const { data } = await api.get(`/web/items/pdfChecklist?id=${id}`);
            setDownload(data.url+'?'+new Date().getTime());
        } catch(error) {

            toast({
                description: 'Houve um erro ao gerar checklist, contate o T.I.',
                status: 'error',
                duration: 4000
            });
        } finally {
            setLoadings(oldState => ({ ...oldState, generateChecklist: false }));
        }
    }
    
    async function editStatus(status: number) {
        try {
            await api.patch('/web/records/editStatus', { id, status });

            toast({
                description: 'Status atualizado com sucesso!',
                status: 'success',
                duration: 2000
            });
        } catch (error) {
            toast({
                description: 'Houve um erro ao recuperar os registros, contate o T.I.',
                status: 'error',
                duration: 4000
            });
        }
    }

    function updateChecklist(checklist: IChecklist) {
        setItemRecord(oldState => ({ ...oldState, record: { ...oldState.record, checklist } }));
    }

    async function editComent({ id, text }:{id: number, text: string}) {
        try {
            if(text.trim().length == 0) {
                toast({
                    description: 'O comentário não pode ficar vazio.',
                    status: 'warning',
                    duration: 4000
                });
                return
            }

            await api.patch('/web/records/editComent', { id, comment: text.trim() });

        } catch (error) {
            toast({
                description: 'Houve um erro ao recuperar os registros, contate o T.I.',
                status: 'error',
                duration: 4000
            });
        }
    }

    function updateItems(id: number) {
        const newItems = itemRecord.items.filter(item => item.id != id);

        setItemRecord(oldState => ({ ...oldState, items: newItems }));
    }

    function openModalDeleteItem(id: number) {
        setCurrentItem(id);
        onOpenDeleteItem();
    }

    useEffect(() => {
        getItems();
    },[])

    return (
        <Box>
            <Sidebar />

            <Flex w="100%" direction="column">
                <Header title={`Registro #${id}`} />
                {!!download && <Box as="iframe" display="none" src={download} ></Box>}

                <Box bgColor="white" borderRadius={6} m={4} p={4}>
                    <Flex justify="space-between">
                        <Button
                            onClick={() => router.back()}
                            bgColor='transparent'
                            _hover={{ bgColor: 'orange.200' }}
                            _active={{ bgColor: 'transparent' }}
                        >
                            <Flex gap={4} alignItems="center">
                                <FiChevronLeft style={{ width: 22, height: 22 }} />
                                Voltar
                            </Flex>
                        </Button>

                        {itemRecord?.items?.length > 0 && <Flex gap={2}>
                            <Button onClick={() => generatePDF('1')} isLoading={loadings.generatePdfNormal} disabled={loadings.generatePdfNormal || loadings.generatePdfEnclosure} colorScheme="red" variant="ghost">
                                <Text mr={2}>Gerar PDF</Text>
                                <FiDownloadCloud style={{ width: 22, height: 22 }} />
                            </Button>
                        </Flex>}
                    </Flex>

                    <Divider mt={2} />

                    {loadings.getItem ? <Flex justify="center">
                        <Box w={250} mt={50}>
                            <Lottie
                                animationData={LottieLoadingRecordItem}
                            />
                        </Box>
                    </Flex>
                    :
                    <>
                        <Flex justify="space-between" mt={4}>
                            <Text display="block" as="strong" fontSize="lg">Dados do registro&nbsp;</Text>

                            {itemRecord?.record?.checklist != null ?
                                <ButtonGroup size='sm' isAttached variant='solid' colorScheme="green">
                                    <Button isDisabled={loadings.generateChecklist} size="sm" onClick={onOpen}>Checklist</Button>
                                    <IconButton onClick={generateChecklist} isLoading={loadings.generateChecklist} aria-label='Add to friends' icon={<DownloadIcon />} />
                                </ButtonGroup> :
                                <Text fontStyle="italic">Não possuí checklist</Text>
                            }
                        </Flex>
                        <SimpleGrid mt={2} columns={[1,2,3,4]}>
                            <Flex fontSize="md">
                                <Text><Text as="strong">Auditado por:&nbsp;</Text>{itemRecord?.record?.creator}</Text>
                            </Flex>
                            <Flex fontSize="md">
                                <Text><Text as="strong">Setor:&nbsp;</Text>{itemRecord?.record?.department}</Text>
                            </Flex>
                            <Flex fontSize="md">
                                <Text><Text as="strong">Data da auditoria:&nbsp;</Text>{itemRecord?.record?.created_at}</Text>
                            </Flex>
                            <Flex alignItems="center" fontSize="md">
                                <Text as="strong">Status:&nbsp;</Text>
                                <Select onChange={e => editStatus(Number(e.target.value))} w="fit-content" size="xs" defaultValue={itemRecord?.record?.status_id}>
                                    <option value={1}>Em andamento</option>
                                    <option value={2}>Finalizado</option>
                                </Select>
                            </Flex>
                        </SimpleGrid>

                        <Text display="block" mt={6} as="strong" fontSize="lg">Fotos&nbsp;</Text>
                        {itemRecord?.items?.length === 0 ?
                        <Flex justify="center" direction="column" align="center">
                            <Box w={350} mt={50}>
                                <Lottie
                                    animationData={LottieNoPictures}
                                />
                            </Box>
                            <Text mt={4}>Nenhuma imagem encontrada neste registro</Text>
                        </Flex> :
                        <SimpleGrid gap={6} mt={2} columns={[1,2,3,4]}>
                            {itemRecord?.items?.map((item, index) => (
                                <Flex key={item.id} direction="column" justify="center" alignItems="center" fontSize="md">
                                    <Flex position="relative">
                                        <Box onClick={() => openModalDeleteItem(item.id)} cursor="pointer" borderRadius="50%" p={1} top={-2} right={-2} bgColor="red.400" position="absolute">   
                                            <CloseIcon m={1} mt={0} color="white" />
                                        </Box>
                                        <a download={`Foto_${index+1}_${itemRecord.record.department.replaceAll(' ', '_')}.png`} href={item.picture}>
                                            <Image alt="Foto da auditoria" borderRadius={6} src={item.picture} w={360} bgColor="black" />
                                        </a>
                                    </Flex>
                                    <Editable onSubmit={(text: any) => editComent({ id: item.id, text: text })} mt={2} defaultValue={item.comment.trim().length != 0 ? item.comment : 'Nenhum comentário inserido'}>
                                        <EditablePreview />
                                        <EditableInput required />
                                    </Editable>
                                </Flex>
                            ))}
                        </SimpleGrid>
                        }
                    </>}
                </Box>

                <ModalChecklist
                    id={id}
                    isOpen={isOpen}
                    onClose={onClose}
                    updateChecklist={updateChecklist}
                    checklist={itemRecord?.record?.checklist}
                />
                <ModalDeleteItemRecord
                    id={currentItem}
                    isOpen={isOpenDeleteItem}
                    onClose={onCloseDeleteItem}
                    updateList={updateItems}
                />

            </Flex>
        </Box>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { id } = ctx.query;
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
        props: { id }
    }
}