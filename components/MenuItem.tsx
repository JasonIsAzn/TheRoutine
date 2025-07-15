import { View, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';

type MenuItemProps = {
    icon: [IconPrefix, IconName];
    label: string;
    showDivider?: boolean;
};

export default function MenuItem({
    icon,
    label,
    showDivider = false,
}: MenuItemProps) {
    return (
        <View className="relative">
            <View className="flex-row items-center justify-between px-4 py-3 w-full">
                <View className="flex-row items-center">
                    <View className="mr-4">
                        <FontAwesomeIcon icon={icon} size={20} color="#FFD124" />
                    </View>
                    <Text className="text-xl">{label}</Text>
                </View>

                <FontAwesomeIcon
                    icon={['fas', 'chevron-right']}
                    size={16}
                    color="#808080"
                />
            </View>

            {showDivider && (
                <View className="absolute bottom-0 left-14 right-4 h-px bg-gray opacity-30" />
            )}
        </View>
    );
}
