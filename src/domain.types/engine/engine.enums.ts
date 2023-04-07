
export enum ContextType {
    Person  = 'Person',
    Group   = 'Group',
}

export const ContextTypeList: ContextType[] = [
    ContextType.Person,
    ContextType.Group,
];

export enum SchemaType {
    //These kind of schemas are for cases where they get executed only once for a given context.
    //For example, awarding some promotion coupons on a given occasion.
    ExecuteOnce = 'ExecuteOnce',

    //On every incoming event, reuse the same instance. This is suitable for usecases,
    //where on every event we want to check some light weight logic execution.
    ReuseExistingInstance = 'ReuseExistingInstance',

    //Recreate new instance after the execution of the previous one.
    RecreateNewAfterExecution = 'RecreateNewAfterExecution'
}

export const SchemaTypeList: SchemaType[] = [
    SchemaType.ExecuteOnce,
    SchemaType.ReuseExistingInstance,
    SchemaType.RecreateNewAfterExecution,
];

export enum OperatorType {
    Logical      = 'Logical',
    Mathematical = 'Mathematical',
    Composition  = 'Composition',
    Iterate      = 'Iterate'
}

export const OperatorList: OperatorType[] = [
    OperatorType.Logical,
    OperatorType.Mathematical,
    OperatorType.Composition,
    OperatorType.Iterate,
];

export enum CompositionOperator {
    And  = 'And',
    Or   = 'Or',
    None = 'None'
}

export const CompositionOperatorList: CompositionOperator[] = [
    CompositionOperator.And,
    CompositionOperator.Or,
    CompositionOperator.None,
];

export enum LogicalOperator {
    Equal                     = 'Equal',
    NotEqual                  = 'NotEqual',
    GreaterThan               = 'GreaterThan',
    GreaterThanOrEqual        = 'GreaterThanOrEqual',
    LessThan                  = 'LessThan',
    LessThanOrEqual           = 'LessThanOrEqual',
    In                        = 'In',
    NotIn                     = 'NotIn',
    Contains                  = 'Contains',
    DoesNotContain            = 'DoesNotContain',
    Between                   = 'Between',
    IsTrue                    = 'IsTrue',
    IsFalse                   = 'IsFalse',
    Exists                    = 'Exists',
    HasConsecutiveOccurrences = 'HasConsecutiveOccurrences', //array, checkFor, numTimes
    RangesOverlap             = 'RangesOverlap',
    None                      = 'None',
}

export const LogicalOperatorList: LogicalOperator[] = [
    LogicalOperator.Equal,
    LogicalOperator.NotEqual,
    LogicalOperator.GreaterThan,
    LogicalOperator.GreaterThanOrEqual,
    LogicalOperator.LessThan,
    LogicalOperator.LessThanOrEqual,
    LogicalOperator.In,
    LogicalOperator.NotIn,
    LogicalOperator.Contains,
    LogicalOperator.DoesNotContain,
    LogicalOperator.Between,
    LogicalOperator.IsTrue,
    LogicalOperator.IsFalse,
    LogicalOperator.Exists,
    LogicalOperator.HasConsecutiveOccurrences,
    LogicalOperator.RangesOverlap,
    LogicalOperator.None,
];

export enum MathematicalOperator {
    Add        = 'Add',
    Subtract   = 'Subtract',
    Divide     = 'Divide',
    Multiply   = 'Multiply',
    Percentage = 'Percentage',
    None       = 'None',
}

export const MathematicalOperatorList: MathematicalOperator[] = [
    MathematicalOperator.Add,
    MathematicalOperator.Subtract,
    MathematicalOperator.Divide,
    MathematicalOperator.Multiply,
    MathematicalOperator.Percentage,
    MathematicalOperator.None,
];

export enum OperandDataType {
    Float   = 'Float',
    Integer = 'Integer',
    Boolean = 'Boolean',
    Text    = 'Text',
    Array   = 'Array',
}

export const ConditionOperandDataTypeList: OperandDataType[] = [
    OperandDataType.Float,
    OperandDataType.Integer,
    OperandDataType.Boolean,
    OperandDataType.Text,
    OperandDataType.Array,
];

export enum EventActionType {
    ExecuteNext = "ExecuteNext",
    WaitForInputEvents = "WaitForInputEvents",
    Exit = "Exit",
    AwardBadge = "AwardBadge",
    AwardPoints = "AwardPoints",
    CalculateContinuityBadges = "CalculateContinuityBadges",
    ExtractExistingBadges = "ExtractExistingBadges",
    Custom = "Custom",
}

export const EventActionTypeList: EventActionType[] = [
    EventActionType.ExecuteNext,
    EventActionType.WaitForInputEvents,
    EventActionType.Exit,
    EventActionType.AwardBadge,
    EventActionType.AwardPoints,
    EventActionType.CalculateContinuityBadges,
    EventActionType.ExtractExistingBadges,
    EventActionType.Custom,
];

export enum ExecutionStatus {
    Pending = "Pending",
    Executed = "Executed",
    Waiting = "Waiting",
    Exited = "Exited",
}

export const ExecutionStatusList: ExecutionStatus[] = [
    ExecutionStatus.Pending,
    ExecutionStatus.Executed,
    ExecutionStatus.Waiting,
    ExecutionStatus.Exited,
];
