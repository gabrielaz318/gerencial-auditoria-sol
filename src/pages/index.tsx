import { 
	Flex, 
	Stack,
	FormControl,
	Input,
	FormLabel,
	FormErrorMessage,
	Button,
	Box,
	Text,
	Center
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

import LogoSOLPng from '../assets/logo-sol.png';
import Image from 'next/image';
import { GetServerSideProps, GetStaticProps } from 'next';
import { getAPIClient } from '../services/axios';
import { parseCookies } from 'nookies';

interface IForm {
	user: string;
	password: string;
}

const schema = yup.object().shape({
	user: yup.string().required('Usuário obrigatório'),
	password: yup.string().min(6, 'Minímo de 6 caracteres').required('A senha é obrigatória')
})

export default function Home() {
	const { signIn } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [errorState, setErroState] = useState({ error: false, message: '' });
	const { register, formState: { errors }, handleSubmit } = useForm<IForm>({
		resolver: yupResolver(schema)
	});
	async function onSubmit({ user, password }: IForm) {
		setIsLoading(true)
		setErroState({ error: false, message: '' })
		
		const data = { user, password };

		try {
			const tl = await signIn(data)
			setErroState({ error: false, message: '' })
		} catch (err: any) {
			if(err?.data?.code ===  4 || err?.data?.code ===  3) {
				setErroState({ error: true, message: err?.data?.message })
			} else if (err?.data?.code ===  2) {
				setErroState({ error: true, message: err?.data?.message })
			} else {
				setErroState({ error: true, message: 'Houve um erro com sua requisição, contate o suporte' })
			}
			setIsLoading(false)
		}
	}

    return (
        <Flex 
			alignItems="center" 
			justifyContent="space-between" 
			h="100vh"
			direction="column"
			backgroundColor="gray.200"
		>
			<Flex h="50px"></Flex>
			<Box 
				maxW="360px" 
				w="100%" 
				bgColor="white" 
				boxShadow="md" 
				p={8}
				borderRadius={8}
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Center mb={4}>
						<Image src={LogoSOLPng}   placeholder="blur" alt="Logo SOL" />
					</Center>
					<Stack spacing={4}>
						<FormControl isReadOnly={isLoading} isInvalid={!!errors?.user?.message}>
							<FormLabel htmlFor="user">Usuário</FormLabel>
							<Input
								id="user"
								placeholder="Usuário"
								{...register('user')}
								type="text"
								bgColor="white"
							/>
							{!!errors?.user?.message && <FormErrorMessage>
								{errors?.user?.message}
							</FormErrorMessage>}
						</FormControl>
						<FormControl isReadOnly={isLoading} isInvalid={!!errors?.password?.message}>
							<FormLabel htmlFor="password">Senha</FormLabel>
							<Box>
								<Input
									id="password"
									placeholder="Senha"
									{...register('password')}
									type="password"
									bgColor="white"
								/>
							</Box>
							{!!errors?.password?.message && <FormErrorMessage>
								{errors?.password?.message}
							</FormErrorMessage>}
						</FormControl>
						<Button isLoading={isLoading} type='submit' colorScheme='green'>Entrar</Button>
					</Stack>
					{errorState.error && <Text pt={4} textAlign="center" color="red.500">
						{errorState.message}
					</Text>}
				</form>
			</Box>
			<Flex mb={6} direction="column" justify="center" align="center">
				<Text fontSize="xs" mb="1">Desenvolvido por: Gabriel Azevedo</Text>
			</Flex>
        </Flex>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const apiClient = getAPIClient(ctx);

    const { 'sol.token': token } = parseCookies(ctx);
	if(token) {
		try {
			await apiClient.get('/auth/me');
			return {
				redirect: {
					destination: '/records',
					permanent: false
				}
			}
		} catch (error) {
			
		}
	}

    return {
        props: {}
    }
}