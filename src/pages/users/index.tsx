import * as yup from 'yup';
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';

import { 
    Tr, 
    Td, 
    Th, 
    Box, 
    Text, 
    Icon, 
    Flex, 
    Thead, 
    Tbody, 
    Table, 
    Stack, 
    Button, 
    Select, 
    Switch, 
    Divider, 
    Skeleton, 
    useToast, 
    FormLabel, 
    DrawerBody, 
    FormControl, 
    DrawerFooter, 
    useDisclosure, 
    FormErrorMessage, 
    useBreakpointValue, 
} from "@chakra-ui/react";

import { MdCheckCircle } from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';
import { RiAddLine, RiPencilLine } from "react-icons/ri";

import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { Input } from "../../components/Form/Input";
import { DrawerRight } from "../../components/Drawers/DrawerRight";
import { useAuth } from '../../contexts/AuthContext';

const EditUserFormSchema = yup.object().shape({
    status: yup.boolean().required(),
	name: yup.string().required('Nome obrigatório'),
	user: yup.string().required('Usuário obrigatório'),
	password: yup.string(),
	password_confirmation: yup.string().oneOf([null, yup.ref('password')],  'As senhas precisam ser iguais')
})

interface IListUsers {
    id: number;
    name: string;
    user: string;
    status: number;
    created_at: string;
}

interface IDataEditUser {
    success: boolean,
    permissions: {
        id?: number;
        nome?: string;
    }[]
    areas: {
        id?: number;
        area?: string;
    }[]
}

interface IUserEditData {
    active: true | false;
    info: {
        id: number;
        name: string;
        user: string;
        status: number;
        created_at: string;
    }
}

interface IEditUser {
    name?: string;
    user?: string;
    status?: number;
    password?: string;
    password_confirmation?: string;
}

export default function Users() {
    const router = useRouter();
    const toast = useToast();
    const { signOut } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [userEditData, setUserEditData] = useState<IUserEditData>({} as IUserEditData);
    const [isLoading, setIsLoading] = useState(false);
    const [listUsers, setListUsers] = useState<IListUsers[]>([] as IListUsers[]);
    const [dataEditUser, setDataEditUser] = useState<IDataEditUser>({} as IDataEditUser);

    const { register, handleSubmit, reset, formState } = useForm({
		resolver: yupResolver(EditUserFormSchema)
	});
	const { errors } = formState;

    function handleCreateNewUser() {
        router.push('/users/create')
    }

    function handleEditUser(id: number) {
        const [dataUser] = listUsers.filter(item => item.id === id)
        setUserEditData({ active: true, info: dataUser })
        onOpen()
        reset()
    }

    const onSubmit: SubmitHandler<IEditUser> = async (data) => {
        try {
            setIsLoading(true);
            const { name, user, password, password_confirmation, status } = data;
            
            const passwordBase64 = Buffer.from(String(password)?.trim(), 'utf-8').toString('base64');
            const confirmPasswordBase64 = Buffer.from(String(password_confirmation)?.trim(), 'utf-8').toString('base64');

            const newData = {
                id: userEditData.info.id,
                name,
                user,
                password: passwordBase64,
                confirmPassword: confirmPasswordBase64,
                status
            }

            await api.patch('/web/users', newData);
            fetchUsers()
            setTimeout(() => {
                handleCloseDrawer();
                toast({
                    title: 'Informações alteradas com sucesso!',
                    status: 'success',
                    duration: 1000  * 5,
                    isClosable: true
                });
            }, 200)
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
                title: 'Houve um erro ao atualizar informações.Contate com o suporte.',
                status: 'error',
                duration: 1000  * 5,
                isClosable: false
            });
        } finally {
            setIsLoading(false)
        }
    }

    function handleCloseDrawer() {
        onClose()

        setTimeout(() => {
            setUserEditData({ active: false, info: {} } as IUserEditData)
        }, 350)
    }

    async function fetchUsers() {
        try {
            const { data } = await api.get('/web/users');
            setListUsers(data)
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
                title: 'Houve um erro ao buscar a lista de usuários. Contate o suporte.',
                status: 'error',
                duration: 1000  * 7,
                isClosable: false
            });
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        async function fetchDataEditUser() {
            try {
                const { data } = await api.get('/users/listDataCreateUser');
                setDataEditUser({
                    success: true,
                    permissions: data.permissoes,
                    areas: data.areas,
                })
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
                setDataEditUser({
                    success: false,
                    permissions: [],
                    areas: [],
                })
            }
        }

        // fetchDataEditUser();
        fetchUsers();
    },[])

    return (
        <Flex backgroundColor="gray.200">
            <Sidebar />

            <Flex w="100%" direction="column">
                <Header title="Usuários" />

                <Box boxShadow="md" backgroundColor="white" m={4} borderRadius={6} p={4}>
                    <Flex direction="column" alignItems="">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text as="strong">Lista de usuários</Text>
                            <Button 
                                size="sm" 
                                fontSize="sm" 
                                colorScheme="orange"
                                onClick={handleCreateNewUser}
                                w="fit-content"
                                rightIcon={<Icon as={RiAddLine} fontSize="20" />}
                            >
                                Criar novo
                            </Button>
                        </Flex>
                        <Divider my={4} />
                    </Flex>
                    <Box overflowX="auto">
                        <Table colorScheme="orange" pb="2">
                            <Thead>
                                <Tr>
                                    <Th>Nome</Th>
                                    <Th>Usuário</Th>
                                    <Th>Criado em</Th>
                                    <Th>Status</Th>
                                    <Th w="8" />
                                </Tr>
                            </Thead>
                            <Tbody mb="2">
                                {!!listUsers.length ?
                                listUsers.map(item => (
                                    <Tr key={item.id} _hover={{ bgColor: "orange.50" }}>
                                        <Td>
                                            <Text fontWeight="bold">{item.name}</Text>
                                        </Td>
                                        <Td>
                                            <Text>{item.user}</Text>
                                        </Td>
                                        <Td>
                                            <Text>{item.created_at}</Text>
                                        </Td>
                                        <Td>
                                            {
                                                item.status === 1 ?
                                                <Icon as={MdCheckCircle} w={6} h={6} color="green.500" />
                                                :
                                                <Icon as={IoMdCloseCircle} w={6} h={6} color="red.500" />
                                            }
                                        </Td>
                                        <Td>
                                            <Button
                                                size="sm"
                                                fontSize="sm"
                                                colorScheme="orange"
                                                leftIcon={<Icon as={RiPencilLine} fontSize="16" />}
                                                onClick={() => handleEditUser(item.id)}
                                            >
                                                Editar
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                                :
                                <>
                                    <Tr>
                                        <Td><Skeleton w="170px" h="20px" /></Td>
                                        <Td><Skeleton w="280px" h="20px" /></Td>
                                        <Td><Skeleton w="130px" h="20px" /></Td>
                                        <Td><Skeleton w="80px" h="20px" /></Td>
                                        <Td><Skeleton w="80px" h="20px" /></Td>
                                    </Tr>
                                    <Tr>
                                        <Td><Skeleton w="150px" h="20px" /></Td>
                                        <Td><Skeleton w="280px" h="20px" /></Td>
                                        <Td><Skeleton w="90px" h="20px" /></Td>
                                        <Td><Skeleton w="80px" h="20px" /></Td>
                                        <Td><Skeleton w="80px" h="20px" /></Td>
                                    </Tr>
                                    <Tr>
                                        <Td><Skeleton w="240px" h="20px" /></Td>
                                        <Td><Skeleton w="240px" h="20px" /></Td>
                                        <Td><Skeleton w="150px" h="20px" /></Td>
                                        <Td><Skeleton w="80px" h="20px" /></Td>
                                        <Td><Skeleton w="80px" h="20px" /></Td>
                                    </Tr>
                                </>}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </Flex>

            {!!userEditData.active && <DrawerRight title="Editar usuário" isOpen={isOpen} onOpen={onOpen} onClose={handleCloseDrawer}>
                <Flex flex={1} direction="column" justifyContent="space-between">
                    <DrawerBody h="100%">
                        <Stack as="form" id='form-edit' name='form-edit' onSubmit={handleSubmit(onSubmit)} spacing={4}>
                            <FormControl>
                                <Flex alignItems="center">
                                    <FormLabel>Usuário ativo? </FormLabel>
                                    <Switch isReadOnly={isLoading} {...register('status')} defaultChecked={!!userEditData.info.status} mb={2} colorScheme="orange" />
                                </Flex>
                            </FormControl>
                            <Input 
                                isReadOnly={isLoading}
                                type="text"
                                label="Nome"
                                defaultValue={userEditData.info.name}
                                {...register('name')}
                                error={errors.name}
                            />
                            <Input 
                                isReadOnly={isLoading}
                                type="text"
                                label="Usuário"
                                defaultValue={userEditData.info.user}
                                {...register('user')}
                                error={errors.user}
                            />
                            <Input 
                                isReadOnly={isLoading}
                                type="password"
                                defaultValue=""
                                label="Senha"
                                {...register('password')}
                                error={errors.password}
                            />
                            <Input 
                                isReadOnly={isLoading}
                                type="password"
                                defaultValue=""
                                label="Confirme a senha"
                                {...register('password_confirmation')}
                                error={errors.password_confirmation}
                            />
                        </Stack>
                        <Text mt={4} fontSize='sm' color="gray.400">* Caso não queira trocar a senha deixe os campos referentes a senha vazios.</Text>
                    </DrawerBody>
                    <DrawerFooter>
                        <Flex justifyContent="flex-end" mb="3">
                            <Button
                                variant="outline"
                                mr={4}
                                onClick={handleCloseDrawer}
                                isDisabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                isLoading={isLoading}
                                loadingText="Alterando"
                                colorScheme='green'
                                type='submit'
                                form="form-edit"
                            >
                                Salvar
                            </Button>
                        </Flex>
                    </DrawerFooter>
                </Flex>
            </DrawerRight>}
        </Flex>
    )
}

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//     const { 'sol.token': token } = parseCookies(ctx);

//     const url = ctx.resolvedUrl;
    
//     if(!token) {
//         return {
//             redirect: {
//                 destination: !!url ? `/?url=${url}` : '/',
//                 permanent: false

//             }
//         }
//     }

//     return {
//         props: {}
//     }
// }