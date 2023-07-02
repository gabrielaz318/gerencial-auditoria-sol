import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from "next/router";
import { BsChevronLeft } from "react-icons/bs";
import { Box, Button, Divider, Flex, HStack, Icon, IconButton, SimpleGrid, Text, useToast } from "@chakra-ui/react";

import { Input } from "../../components/Form/Input";
import { Header } from "../../components/Header";
import { Sidebar } from "../../components/Sidebar";
import { api } from '../../services/api';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { getAPIClient } from '../../services/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CreateUserFormSchema = yup.object().shape({
	name: yup.string().required('Nome obrigatório'),
	user: yup.string().required('Usuário obrigatório'),
	password: yup.string().required('Senha obrigatória').min(6, 'No mínimo 6 caracteres'),
	passwordConfirmation: yup.string().oneOf([null, yup.ref('password')],  'As senhas precisam ser iguais')
})

interface ICreateNewUserFormData {
    name?: string;
    user?: string;
    password?: string;
    passwordConfirmation?: string;
}

export default function Create() {
    const toast = useToast();
    const router = useRouter();
    const { signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState } = useForm({
		resolver: yupResolver(CreateUserFormSchema)
	});
	const { errors } = formState;

    const onSubmit: SubmitHandler<ICreateNewUserFormData> = async (data) => {
        try {
            setLoading(true);
            const { name, password, passwordConfirmation, user } = data;

            if(password?.trim() != passwordConfirmation?.trim()) {
                toast({
                    title: 'As senhas não são idênticas.',
                    status: 'warning',
                    duration: 1000  * 4,
                    isClosable: true
                });
                return
            }

            await api.post('/web/users', { name, password, confirmPassword: passwordConfirmation, user });
            toast({
                title: 'Usuário cadastrado com sucesso!',
                status: 'success',
                duration: 1000  * 4,
                isClosable: true
            });
            router.back();
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
                title: 'Houve um erro ao registrar o usuario. Contate o com o suporte.',
                status: 'error',
                duration: 1000  * 5,
                isClosable: false
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Flex backgroundColor="gray.200">
            <Sidebar />
            
            <Flex w="100%" direction="column">
                <Header title="Usuários" />

                <Box boxShadow="md" backgroundColor="white" m={4} borderRadius={6} p={4}>
                    <Flex direction="column" >
                        <HStack>
                            <IconButton
                                aria-label="logout"
                                fontSize="20"
                                variant="none"
                                _hover={{
                                    background: "white",
                                    color: 'orange.300'
                                }}
                                icon={<Icon as={BsChevronLeft} />}
                                onClick={router.back}
                                color="orange.700"
                            />
                            <Text as="strong">Criar novo usuário</Text>
                        </HStack>
                        <Divider my={4} />
                    </Flex>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <SimpleGrid gap={4} columns={[1, null, 2]}>
                            <Input
                                isDisabled={loading} 
                                type="text"
                                label="Nome"
                                {...register('name')}
                                error={errors.nome}
                            />
                            <Input
                                isDisabled={loading} 
                                type="text"
                                label="Usuário"
                                {...register('user')}
                                error={errors.user}
                            />
                            <Input
                                isDisabled={loading} 
                                type="password"
                                label="Senha"
                                {...register('password')}
                                error={errors.password}
                            />
                            <Input
                                isDisabled={loading} 
                                type="password"
                                label="Confirme a senha"
                                {...register('passwordConfirmation')}
                                error={errors.passwordConfirmation}
                            />
                        </SimpleGrid>

                        <Flex justifyContent="flex-end" mt={4}>
                            <Button
                                isDisabled={loading} 
                                onClick={router.back}
                                variant="outline"
                                mr={4}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                isLoading={loading} 
                                loadingText="Criando"
                                isDisabled={loading} 
                                type="submit" 
                                colorScheme="orange"
                            >
                                Criar
                            </Button>
                        </Flex>
                    </form>
                </Box>
            </Flex>
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