import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Avatar, Box, Button, Divider, Flex, FormControl, FormErrorMessage, FormLabel, Heading, Icon, IconButton, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, Tooltip, useDisclosure, useToast } from "@chakra-ui/react";
import { RiMenuLine } from "react-icons/ri";
import { MdOutlineLogout } from "react-icons/md";
import { useSidebarDrawer } from "../../contexts/SidebarDrawerContext";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import { api } from '../../services/api';

interface IHeader {
    title: string;
}

const schemaChangePass = yup.object().shape({
	password: yup.string().min(6, 'Minímo de 6 caracteres').required('Insira um senha.'),
    passwordConfirmation: yup.string().min(6, 'Minímo de 6 caracteres')
        .oneOf([yup.ref('password'), null], 'As senhas precisam ser idênticas.')
});

export function Header({ title }: IHeader) {
    const toast = useToast();
    const { user } = useAuth();
    const { signOut } = useAuth();
    const { onOpen } = useSidebarDrawer();
    const { isOpen, onToggle, onClose } = useDisclosure();
    const [loadingUpdatePass, setLoadingUpdatePass] = useState(false);

    const { register, handleSubmit, formState, reset } = useForm({
		resolver: yupResolver(schemaChangePass)
	});

    const { errors } = formState;

    const handleSubmitForm = async (data: { password?: string; passwordConfirmation?: string; }) => {
       try {
            setLoadingUpdatePass(true);

            const newPassword = Buffer.from(data.password || '', 'utf-8').toString('base64');
            const newConfirmPassword = Buffer.from(data.passwordConfirmation || '', 'utf-8').toString('base64');

            await api.patch('/web/users/changePassAuthenticated', {
                password: newPassword, 
                confirmPassword: newConfirmPassword
            });

            toast({
                duration: 1000 * 4,
                isClosable: false,
                status: 'success',
                description: 'Sua senha foi alterada com sucesso!'
            });
            onClose();
            reset()
       } catch (error) {
            toast({
                duration: 1000 * 4,
                isClosable: false,
                status: 'error',
                description: 'Houve um erro ao alterar a senha, contate o T.I.'
            });
       } finally {
           setLoadingUpdatePass(false);
       }
    }

    return (
        <Flex 
            w="100%" 
            alignItems="center" 
            h="16" 
            backgroundColor="orange.500"
            p={4}
            justifyContent="space-between"
        >   
            <Flex alignItems="center">
                <IconButton
                    aria-label="open navigation"
                    icon={<Icon as={RiMenuLine} />}
                    fontSize="24"
                    variant="unstyled"
                    onClick={onOpen}
                    color="white"
                    mr="2"
                    mb={-1.5}
                >

                </IconButton>
                <Heading size="md" color="white">{ title }</Heading>
            </Flex>
            
            <Flex align="center">
                <Popover
                    isOpen={isOpen}
                    onClose={onClose}
                >
                    <PopoverTrigger>
                        <Button onClick={onToggle} mr={2} p={1} _focus={{ boxShadow: '0 0 0 0 transparent' }} _hover={{ backgroundColor: 'transparent', boxShadow: '0 0 4px 6px rgba(0, 0, 0, 0.04);' }} _active={{ opacity: .6 }} borderRadius={4} bgColor="transparent">
                            <Tooltip hasArrow label="Alterar senha" bg="white" borderColor="gray.400" borderWidth={1}>
                                <Flex gap={3}>
                                    <Flex direction="column" justify="center" alignItems="flex-end">
                                        <Heading m={0} p={0} size="small" color="white">{user?.name}</Heading>
                                    </Flex>
                                    <Box>
                                    <Divider orientation='vertical' colorScheme="whiteAlpha" />
                                    </Box>
                                    <Flex alignItems="center">
                                        <Avatar size="sm"name={user?.name} src='https://bit.ly/tioluwani-kolawole' />
                                    </Flex>
                                </Flex>
                            </Tooltip>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Alteração de senha</PopoverHeader>
                        <PopoverBody>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <FormControl isInvalid={!!errors?.password?.message} mb={4}>
                                    <FormLabel size="sm">Insira sua nova senha</FormLabel>
                                    <Input
                                        colorScheme="orange"
                                        size="sm"
                                        type="password"
                                        {...register('password')}
                                    />
                                    {errors?.password?.message && <Text>{errors?.password?.message as string}</Text>}
                                </FormControl>
                                <FormControl isInvalid={!!errors?.passwordConfirmation?.message} mb={4}>
                                    <FormLabel size="sm">Confirme a senha</FormLabel>
                                    <Input
                                        colorScheme="orange"
                                        size="sm"
                                        type="password"
                                        {...register('passwordConfirmation')}
                                    />
                                    {errors?.passwordConfirmation?.message && <FormErrorMessage>{errors?.passwordConfirmation?.message as string}</FormErrorMessage>}
                                </FormControl>
                                <Button isLoading={loadingUpdatePass} size="sm" w="100%" type="submit" colorScheme="orange">
                                    Alterar senha
                                </Button>
                            </form>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
                <IconButton
                    aria-label="logout"
                    fontSize="26"
                    variant="ghost"
                    _hover={{
                        background: "orange.700",
                    }}
                    _active={{
                        background: "orange.700",
                    }}
                    icon={<Icon as={MdOutlineLogout} />}
                    onClick={signOut}
                    color="white"
                    ml={4}
                />
            </Flex>
        </Flex>
    )
}