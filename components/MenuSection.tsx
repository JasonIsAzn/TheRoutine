import { View } from 'react-native';

export default function MenuSection({ children }: { children: React.ReactNode }) {
    return (
        <View className="flex-1 bg-white rounded-xl mb-4 overflow-hidden">
            {children}
        </View>
    );
}
