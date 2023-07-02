import { Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { api } from "../../services/api";

interface IModalDeleteItemRecord {
    id: number;
    isOpen: boolean;
    onClose: () => void;
    updateList: (id: number) => void;
}

export function ModalDeleteItemRecord({ id, isOpen, onClose, updateList }: IModalDeleteItemRecord) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    async function deleteRecord() {
        try {
            setLoading(true);

            await api.delete('/web/records/item?id='+id);

            updateList(id);
            onClose();

            toast({
                duration: 2500,
                status: 'success',
                description: 'Foto deletada com sucesso!'
            });
        } catch (error) {
            console.log(error)
            toast({
                duration: 3500,
                status: 'error',
                description: 'Não foi possível deletar essa foto, contate o departamento de T.I'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Deletar foto</ModalHeader>
                {!loading && <ModalCloseButton />}
                <ModalBody>
                    <Text>Você quer realmente deletar esta foto?</Text>
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