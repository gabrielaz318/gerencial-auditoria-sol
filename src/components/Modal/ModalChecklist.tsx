import { CheckIcon } from "@chakra-ui/icons";
import { Box, Center, Divider, Flex, Heading, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Slide, Spinner, Stack, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IChecklist } from "../../pages/records/[id]";
import { api } from "../../services/api";

interface IModalChecklist {
    id: number;
    isOpen: boolean;
    onClose: () => void;
    updateChecklist: (checklist: IChecklist) => void;
    checklist: IChecklist | null;
}

export function ModalChecklist({ id, checklist, isOpen, onClose, updateChecklist }: IModalChecklist) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);

    function calcAverage(current_checklist: IChecklist) {
        let average = 0;

        for (const item of current_checklist.checklist) {
            average += item.items.filter(item => item.grade != -1).reduce((acc, item2) => acc + item2.grade, 0)/item.items.filter(item => item.grade != -1).length
        }

        return (average/current_checklist.checklist.length).toFixed(1);
    }

    function changeChecklist(title: string, itemToChange: string, newGrade: number) {
        setChanged(true)
        const newItemsChecklist = checklist?.checklist.map(item => {
            if(item.title == title) {
                const newItems = item.items.map(item2 => {
                    if(item2.item == itemToChange) {
                        return {
                            ...item2,
                            grade: item2.grade == newGrade ? -1 : newGrade
                        }
                    } else {
                        return item2;
                    }
                })
                return {
                    title: item.title,
                    items: newItems
                };
            } else {
                return item;
            }
        });

        const completeChecklist = {
            checklist: newItemsChecklist,
            grades: checklist?.grades,
            version: checklist?.version
        } as IChecklist;

        updateChecklist(completeChecklist);
    }

    async function sendChecklist() {
        try {
            setLoading(true);

            await api.patch('/web/records/editChecklist', { id, checklist: JSON.stringify(checklist) });

            toast({
                description: 'Checklist salvo com sucesso!',
                status: 'success',
                duration: 2500
            });

            closeModal();
        } catch (error) {
            toast({
                description: 'Houve um erro ao enviar checklist, contate o T.I.',
                status: 'error',
                duration: 4000
            });
        } finally {
            setLoading(false);
        }
    }

    function closeModal() {
        setChanged(false);
        onClose();
    }

    return (
        <Modal size="4xl" isOpen={isOpen} onClose={closeModal}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Checklist - v{checklist?.version}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex mb={8} justify="space-evenly">
                        {checklist?.checklist?.map((item ,index) => (
                            <Box key={index} borderWidth="1px" borderRadius={6} borderColor="orange.500">
                                <Text textTransform="uppercase" px="8px" py="4px" fontWeight="bold" color="white" bgColor="orange.500" textAlign="center">{item.title}</Text>
                                <Text fontWeight="bold" py="4px" textAlign="center">{(item.items.filter(item => item.grade != -1).reduce((acc, item2) => acc + item2.grade, 0)/item.items.filter(item => item.grade != -1).length).toFixed(1)}</Text>
                            </Box>
                        ))}
                        <Box borderWidth="1px" borderRadius={6} borderColor="orange.500">
                            <Text textTransform="uppercase" px="8px" py="4px" fontWeight="bold" color="white" bgColor="orange.500" textAlign="center">Média final</Text>
                            <Text fontWeight="bold" py="4px" textAlign="center">{checklist?.checklist && <Text textAlign="center">{calcAverage(checklist)}</Text>}</Text>
                        </Box>
                    </Flex>

                    <Stack spacing={6} mb={8}>
                        {checklist?.checklist.map((item, index, array) => (
                            <Box p={4} borderWidth="1px" borderColor="orange.200" borderRadius="8px" key={item?.title}>
                                <Heading color="orange.600" textTransform="uppercase" textDecoration="underline" size="md" mb={6}>{item.title}</Heading>

                                {item.items.map((item2, index, array) => (
                                    <>
                                        <Flex justify="space-between" alignItems="center" key={index}>
                                            <Stack>
                                                <Text><Text as="strong">Item</Text>: {item2.item}</Text>
                                                <Text><Text as="strong">Critérios</Text>: {item2.desc}</Text>
                                            </Stack>

                                            <Flex gap={4} ml={8}>
                                                {checklist?.grades.map((item3, index) => (
                                                    <HStack spacing={4} key={index}>
                                                        <Flex 
                                                            w={8}
                                                            h={8}
                                                            borderWidth={1}
                                                            cursor="pointer"
                                                            borderRadius={4}
                                                            justify="center"
                                                            alignItems="center"
                                                            onClick={() => changeChecklist(item?.title, item2?.item, item3?.grade)}
                                                            borderColor={Number(item3.grade) == Number(item2.grade) ? 'transparent' : item3.color}
                                                            bgColor={Number(item3.grade) != Number(item2.grade) ? 'transparent' : item3.color}
                                                        >
                                                            <Text color={Number(item3.grade) == Number(item2.grade) ? 'white' : item3.color}>{item3.grade}</Text>
                                                        </Flex>
                                                    </HStack>
                                                ))}
                                            </Flex>
                                        </Flex>
                                        {index != array.length -1 && <Divider my={4} />}
                                    </>
                                ))}

                            </Box>
                        ))}
                    </Stack>

                    <Slide direction='bottom' in={changed} style={{ zIndex: 10 }}>
                        <Flex _hover={{ filter: 'brightness(.8)', transition: 'all .3s ease-in-out' }} cursor="pointer" justify="center">
                            <Flex onClick={loading ? () => {} : sendChecklist} py={2} px={3} gap={3} alignItems="center" bgColor="teal.500" mb={3} borderRadius="32px">
                                {
                                    loading ?
                                        <Spinner thickness="3px" color="white" /> :
                                        <>
                                            <Text color="white" fontWeight="bold">Salvar alterações</Text>
                                            <Divider orientation="vertical" />
                                            <CheckIcon color="white" />
                                        </>
                                }
                            </Flex>
                        </Flex>
                    </Slide>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}