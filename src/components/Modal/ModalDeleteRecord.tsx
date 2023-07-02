import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { api } from "../../services/api";

interface IModalDeleteRecord {
    id: number;
    isOpen: boolean;
    onClose: () => void;
    updateList: (id: number) => void;
}

export function ModalDeleteRecord({ id, isOpen, onClose, updateList }: IModalDeleteRecord) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    async function deleteRecord() {
        try {
            setLoading(true);

            await api.delete('/web/records?id='+id);

            updateList(id);
            onClose();

            toast({
                duration: 2500,
                status: 'success',
                description: 'Registro deletado com sucesso!'
            });
        } catch (error) {
            console.log(error)
            toast({
                duration: 3500,
                status: 'error',
                description: 'Não foi possível deletar este registro, contate o departamento de T.I'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Deletar registro</ModalHeader>
                {!loading && <ModalCloseButton />}
                <ModalBody>
                    <Text>Você quer realmente deletar o registro n°{id}?</Text>
                    <Text mt={2}>Caso exista alguma foto ou checklist estes também serão deletados.</Text>
                </ModalBody>
                <ModalFooter>
                    <Flex gap={4}>
                        <Button onClick={onClose} isDisabled={loading} variant="ghost">Cancelar</Button>
                        <Button onClick={deleteRecord} isLoading={loading} colorScheme="red">Deletar</Button>
                    </Flex>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}