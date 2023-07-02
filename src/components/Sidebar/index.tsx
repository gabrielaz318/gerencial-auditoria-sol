

import Image from "next/image";
import { SidebarNav } from "./SidebarNav";
import { Box, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, useBreakpointValue } from "@chakra-ui/react";

import { useSidebarDrawer } from '../../contexts/SidebarDrawerContext';
import { Logo } from "./Logo";

export function Sidebar() {
    const { isOpen, onClose } = useSidebarDrawer();

    const isDrawerSideBar = useBreakpointValue({
        base: true,
        lg: false
    })
    
    if(true) {
        return (
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} >
                <DrawerOverlay>
                    <DrawerContent bg="orange.400">
                        <DrawerHeader>
                            <Logo />
                        </DrawerHeader>
                        <DrawerCloseButton color="white" />
                        <DrawerBody p={0}>
                            <Flex h="100%" direction="column" justify="space-between">
                                <SidebarNav />
                            </Flex>
                        </DrawerBody>
                    </DrawerContent>
                </DrawerOverlay>
            </Drawer>
        )
    }

    return (
        <Flex
            position="fixed"
            top={0}
            left={0}
            maxWidth={64}
            h="100vh"
            w="100%" 
            backgroundColor="teal.400" 
            py={2}
            justify="space-between"
            direction="column"
        >
            <Box>
                <Flex w="100%" justifyContent="center">
                    <Logo/>
                </Flex>
                <SidebarNav/>
            </Box>
        </Flex>
    )
}