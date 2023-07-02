import { Box, Button, Editable, EditableInput, EditablePreview, Flex, HStack, IconButton, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Spinner, Stack, Td, Text, Tr, useDisclosure, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TableParameters } from "../components/Tables/TableParameters";
import { api } from "../services/api";
import { FiEye, FiTrash2 } from 'react-icons/fi';
import { AddIcon } from "@chakra-ui/icons";
import { useAuth } from "../contexts/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";

interface IDepartments {
    id: number;
    department: string;
}

export default function Parameters() {
    const toast = useToast();
    const { signOut } = useAuth();
    const refInputDepartment = useRef<any>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loadingDelete, setLoadingDelete] = useState({ id: 0, list: '' });
    const [loadingActivate, setLoadingActivate] = useState(false);
    const [loadings, setLoadings] = useState({ departmentInput: false, departments: true });
    const [departments, setDepartments] = useState<IDepartments[]>([] as IDepartments[]);
    const [warningConflict, setWarningConflict] = useState({ message: '', id: 0, type: '' });

    async function getDepartments() {
        try {
            const { data } = await api.get<IDepartments[]>('/web/parameters/department');
            setDepartments(data);
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
                description: 'Houve um erro ao recuperar a lista de setores. Contate o T.I.',
                duration: 5000,
                status: 'success'
            });
        } finally {
            setLoadings(oldState => ({ ...oldState, departments: false }));
            return
        }
    }

    async function updateItem({ id, item }: { item: string, id: number }) {
        try {
            await api.patch('/web/parameters/department', { id, department: item });

            toast({
                description: 'Setor atualizado com sucesso!',
                duration: 1500,
                status: 'success'
            });
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
                description: 'Houve um erro ao editar o setor. Contate o T.I.',
                duration: 5000,
                status: 'success'
            });
        }
    }

    async function activateDepartment({ id }: { id: number }) {
        try {
            setLoadingActivate(true);
            await api.patch('/web/parameters/department/activate', { id });
            await getDepartments();
            toast({
                description: 'Setor reativado com sucesso!',
                duration: 1500,
                status: 'success'
            });
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
                description: 'Houve um erro ao ativar o setor. Contate o T.I.',
                duration: 5000,
                status: 'success'
            });
        } finally {
            onClose();
            setLoadingActivate(false);
        }
    }

    async function deleteItem({ id }: { id: number }) {
        try {
            setLoadingDelete({ id, list: 'departments' });
            await api.delete('/web/parameters/department/'+id);
            setDepartments(oldSate => oldSate.filter(item => item.id != id));

            toast({
                description: 'Setor removido com sucesso!',
                duration: 1500,
                status: 'success'
            });
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
                description: 'Houve um erro ao remover o setor. Contate o T.I.',
                duration: 5000,
                status: 'success'
            });
        } finally {
            setLoadingDelete({ id: 0, list: '' });
        }
    }

    async function createDepartment() {
        try {
            const text = refInputDepartment?.current?.value;

            if(text.trim().length == 0) {
                refInputDepartment?.current?.focus();
                toast({
                    description: 'Para criar um novo setor você precisa antes preencher o campo de texto.',
                    duration: 5000,
                    status: 'warning'
                });
                return
            }

            setLoadings(oldState => ({ ...oldState, departmentInput: true }));

            refInputDepartment.current.value = '';
            await api.post('/web/parameters/department', { department: text.trim() });
            getDepartments();

            toast({
                description: 'Setor criado com sucesso',
                duration: 1500,
                status: 'success'
            });
        } catch (error: any) {
            const { status } = error.response;
            
            if(status === 401) {
                signOut()
                toast({
                    description: 'Seu acesso expirou, realize o login novamente.',
                    status: 'warning',
                    duration: 4000
                });
                return
            }
            if(error?.response?.data) {
                const { code, message, id } = error?.response?.data;
                if(code == 2) {
                    setWarningConflict({ message, id, type: 'department' });
                    onOpen();
                } else if(code == 3) {
                    toast({
                        duration: 1000 * 3,
                        isClosable: true,
                        status: 'warning',
                        description: message
                    });
                } else {
                    toast({
                        duration: 1000 * 4,
                        isClosable: true,
                        status: 'error',
                        description: `Houve um erro ao tentar adicionar o setor. Código: ${code} Status: ${status}`
                    });
                }
            } else {
                toast({
                    duration: 1000 * 4,
                    isClosable: true,
                    status: 'error',
                    description: `Houve um erro ao tentar adicionar o setor. Status: ${status}`
                });
            }
        } finally {
            setLoadings(oldState => ({ ...oldState, departmentInput: false }));
        }
    }

    function controlActivate() {
        switch (warningConflict.type) {
            case 'department':
                activateDepartment({ id: warningConflict.id });
            break;
        }
    }

    useEffect(() => {
        getDepartments();
    },[])

    return (
        <Box>
            <Sidebar />

            <Flex w="100%" direction="column">
                <Header title="Parâmetros" />

                <Box bgColor="white" borderRadius={6} m={4} p={4}>
                    <SimpleGrid gap={6} columns={[1,2]}>
                        <Stack>
                            <Text fontSize="lg" as="strong">Áreas</Text>
                            <HStack>
                                <Input
                                    ref={refInputDepartment}
                                    onKeyDown={(event) => event.key == 'Enter' ? createDepartment() : ()=>{}}
                                    size="sm"
                                />
                                <IconButton
                                    isLoading={loadings.departmentInput}
                                    onClick={createDepartment}
                                    size="sm"
                                    aria-label="Botão para adicionar um novo departamento"
                                    icon={<AddIcon />}
                                />
                            </HStack>
                            {loadings.departments ?
                            <Flex justify="center" align="center" py={8} color="orange.500">
                                <Spinner />
                            </Flex>
                            :
                            departments.length === 0 ?
                            <Flex justify="center" alignItems="center" py={6}>
                                <Text>Nenhuma área foi localizado.</Text>
                            </Flex>
                            :
                            <>
                                <Text color="gray.400" fontSize="sm" fontStyle="italic">Para editar clique no texto desejado</Text>
                                <TableParameters mainHeader="Área">
                                    {departments?.map(item => (
                                        <Tr key={item.id}>
                                            <Td>{item.id}</Td>
                                            <Td>
                                                <Editable onSubmit={() => updateItem({ id: item.id, item: item.department })} defaultValue={item.department}>
                                                    <EditablePreview />
                                                    <EditableInput />
                                                </Editable>
                                            </Td>
                                            <Td>
                                                <IconButton
                                                    isLoading={loadingDelete.list == 'departments' && loadingDelete.id == item.id}
                                                    onClick={() => deleteItem({ id: item.id })}
                                                    size="sm"
                                                    aria-label="Remover área"
                                                    icon={<FiTrash2 />}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                </TableParameters>
                            </>}
                        </Stack>      
                    </SimpleGrid>
                </Box>
            </Flex>

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                <ModalHeader>Opção já existente</ModalHeader>
                <ModalBody>
                    <Text>{warningConflict.message}</Text>
                </ModalBody>
                <ModalFooter>
                    <HStack>
                        <Button onClick={onClose} disabled={loadingActivate} variant="outline" colorScheme="red">Cancelar</Button>
                        <Button onClick={controlActivate} isLoading={loadingActivate} colorScheme="green">Reativar</Button>
                    </HStack>
                </ModalFooter>
                </ModalContent>
            </Modal>
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