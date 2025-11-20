import { Suspense } from "react";
import { SkeletonWrapper } from "../../components/Skeletons/SkeletonWrapper";

interface SuspendedViewProps<TProps> {
  fallback: React.ComponentType<TProps>;
  content: React.ComponentType<TProps>;
  props: TProps;
}

export function SuspendedView<TProps>({
  fallback: Fallback,
  content: Content,
  props
}: SuspendedViewProps<TProps>) {
  return (
    <Suspense
      fallback={
        <SkeletonWrapper loading={true}>
          <Fallback {...(props as any)} />
        </SkeletonWrapper>
      }
    >
      <Content {...(props as any)} />
    </Suspense>
  );
}
